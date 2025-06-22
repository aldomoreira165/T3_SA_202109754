const mongoose = require('mongoose');
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const { Logger } = require('../../utils/Logger');
const { DatabaseConfigParser } = require('./parser');

class DatabaseManager {
  static instance = null;
  
  constructor() {
    this.connections = new Map();
    this.configs = new Map();
    this.CONNECTION_TIMEOUT = 15000; // 15 segundos
  }

  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize() {
    try {
      const configs = DatabaseConfigParser.parse(process.env);
      
      if (configs.length === 0) {
        await Logger.warn('No database configurations found in environment variables');
      }
      
      for (const config of configs) {
        const connectionKey = `${config.type}-${config.alias}`;
        this.configs.set(connectionKey, config);
        // Log de la configuración sin datos sensibles
        const sanitizedConfig = { ...config };
        delete sanitizedConfig.password;
      }
    } catch (error) {
      await Logger.error('Error parsing database configurations:', error);
      throw error;
    }
  }

  async connect(connectionKey) {
    try {
      if (connectionKey) {
        await this.connectOne(connectionKey);
      } else {
        const connections = Array.from(this.configs.keys());
        await Logger.info(`Connecting to databases: ${connections.join(', ')}`);
        
        for (const key of connections) {
          await this.connectOne(key);
        }
      }
    } catch (error) {
      await Logger.error('Database connection error:', error);
      throw error;
    }
  }

  async connectOne(connectionKey) {
    const config = this.configs.get(connectionKey);
    if (!config) {
      throw new Error(`No configuration found for ${connectionKey}`);
    }

    try {
      const connectionPromise = this.createConnection(config);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Connection timeout for ${connectionKey}`)), 
          this.CONNECTION_TIMEOUT);
      });

      const connection = await Promise.race([connectionPromise, timeoutPromise]);
      this.connections.set(connectionKey, connection);
      
      await Logger.ok(`Connected to database: ${connectionKey}`);
      
      // Configurar event listeners para MongoDB
      if (config.type === 'mongo' && connection) {
        connection.on('error', async (error) => {
          await Logger.error(`MongoDB connection error (${connectionKey}):`, error);
        });
        
        connection.on('disconnected', async () => {
          await Logger.warn(`MongoDB disconnected (${connectionKey})`);
        });
        
        connection.on('reconnected', async () => {
          await Logger.ok(`MongoDB reconnected (${connectionKey})`);
        });
      }
    } catch (error) {
      await Logger.error(`Failed to connect to ${connectionKey}:`, error);
      throw error;
    }
  }

  async createConnection(config) {
    switch (config.type) {
      case 'mongo':
        if (!config.url) {
          throw new Error(`MongoDB URL required for ${config.alias}`);
        }
        await Logger.debug(`Creating MongoDB connection for ${config.alias}...`);
        return mongoose.createConnection(config.url, {
          serverSelectionTimeoutMS: this.CONNECTION_TIMEOUT,
          connectTimeoutMS: this.CONNECTION_TIMEOUT,
          socketTimeoutMS: this.CONNECTION_TIMEOUT
        });

      case 'postgres':
        await Logger.debug(`Creating PostgreSQL connection for ${config.alias}...`);
        return new Pool({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          ssl: false,
          connectionTimeoutMillis: this.CONNECTION_TIMEOUT
        });

      case 'mysql':
        await Logger.debug(`Creating MySQL connection for ${config.alias}...`);
        return mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          connectTimeout: this.CONNECTION_TIMEOUT
        });

      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }

  getConnection(type, alias = 'default') {
    const connectionKey = `${type}-${alias}`;
    const connection = this.connections.get(connectionKey);
    
    if (!connection) {
      throw new Error(`No active connection for ${connectionKey}`);
    }
    
    return connection;
  }

  async disconnect() {
    for (const [key, connection] of this.connections) {
      try {
        await Logger.info(`Disconnecting from ${key}...`);
        if (connection?.close) await connection.close();
        if (connection?.end) await connection.end();
        await Logger.info(`Disconnected from ${key}`);
      } catch (error) {
        await Logger.error(`Error disconnecting from ${key}:`, error);
      }
    }
    this.connections.clear();
  }
}

const dbManager = DatabaseManager.getInstance();
module.exports = { dbManager };