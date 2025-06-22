const express = require('express');
const { environment } = require('./config/environment');
const { Logger } = require('./utils/Logger');
const { dbManager } = require('./config/database');
const { errorHandler, initializeMiddlewares } = require('./middlewares');
const { initializeRoutes } = require('./routes');

class Server {
  constructor() {
    // Log síncrono inmediato
    Logger.info('Initializing server...');
    this.app = express();
    this.mongoConnection = null;
    this.setup();
  }

  setup() {
    Logger.info('Setting up server...');
    initializeMiddlewares(this.app);
    initializeRoutes(this.app);
    this.app.use(errorHandler);
    Logger.ok('Server setup completed');
  }
  
  async initializeDatabase() {
    try {
      Logger.info('Initializing databases...');
      await dbManager.initialize();
      await dbManager.connect();
      
    } catch (error) {
      Logger.error(error.message);
      throw error;
    }
  }

  async start() {
    try {
      Logger.info('Starting server...');
      await this.initializeDatabase();
      
      const server = this.app.listen(environment.PORT, () => {
        Logger.ok(`Server running on port ${environment.PORT} - ${environment.NODE_ENV}`);
        Logger.info(`Health check: GET-http://localhost:${environment.PORT}/ && POST-http://localhost:${environment.PORT}/ { ping:1 }`);
        this.logServerInfo();
      });

      server.on('error', (error) => {
        Logger.error(`HTTP server error: ${error.message}`);
        this.shutdown(1);
      });

      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      Logger.error(`Server start failed: ${error.message}`);
      await this.shutdown(1);
    }
  }

  async shutdown(code = 0) {
    try {
      Logger.info('Server shutting down...');
      await dbManager.disconnect();
      process.exit(code);
    } catch (error) {
      Logger.error(`Error during shutdown: ${error.message}`);
      process.exit(1);
    }
  }

  logServerInfo() {
    const memoryUsage = process.memoryUsage();
    Logger.debug('Server Information', {
      environment: environment.NODE_ENV,
      nodeVersion: process.version,
      memoryUsage: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
      },
      pid: process.pid
    });
  }

  getApp() {
    return this.app;
  }
}

module.exports = Server;