const dotenv = require('dotenv');
const { DatabaseConfigParser } = require('./database/parser');
const { validateEnvConfig } = require('../utils/configValidator');
const { Logger } = require('../utils/Logger');

// Cargar variables de entorno
dotenv.config();

// Habilitar modo debug
const DEBUG = process.env.DEBUG === 'true';

// Log de inicio de carga de configuración
if (DEBUG) {
  Logger.debug('Loading environment configuration...');
}

// Validar variables de entorno requeridas
validateEnvConfig(process.env);

// Configurar bases de datos dinámicamente
const databases = DatabaseConfigParser.parse(process.env);

if (DEBUG) {
  Logger.debug(`Found ${databases.length} database configurations`);
}

const environment = {
  // Configuración del servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api',
  DEBUG,

  // Configuración de bases de datos
  DATABASES: {
    default: `${process.env.DB_TYPE || 'postgres'}-${process.env.DB_ALIAS || 'default'}`,
    configs: databases
  },

  // Configuración de seguridad
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d'
  },

  // Configuración de contraseñas
  PASSWORD: {
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10', 10),
    MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    MAX_LENGTH: parseInt(process.env.PASSWORD_MAX_LENGTH || '50', 10)
  },

  // Método helper para obtener información de base de datos
  getDbConfig: (type, alias = 'default') => {
    const connectionKey = `${type}-${alias}`;
    const config = databases.find(db =>
      db.type === type && db.alias === alias
    );

    if (!config) {
      throw new Error(`No database configuration found for ${connectionKey}`);
    }

    return config;
  }
};

// Log de configuración final en modo debug
if (DEBUG) {
  const sanitizedConfig = {
    ...environment,
    JWT: { ...environment.JWT, SECRET: '***********' },
    DATABASES: {
      ...environment.DATABASES,
      configs: environment.DATABASES.configs.map(config => ({
        ...config,
        password: '********',
        url: config.url ? '********' : undefined
      }))
    }
  };

  Logger.debug('Final environment configuration:', sanitizedConfig);
}

// Validaciones adicionales de seguridad
if (!environment.JWT.SECRET) {
  throw new Error('JWT_SECRET is required');
}

if (environment.NODE_ENV === 'production') {
  // Validaciones específicas para producción - REMOVED MONGO_URL requirement
  const requiredProductionVars = [
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_EXPIRY'
  ];

  const missingVars = requiredProductionVars.filter(varname => !process.env[varname]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required production environment variables: ${missingVars.join(', ')}`);
  }

  // Validate that at least one database configuration exists
  if (databases.length === 0) {
    throw new Error('At least one database configuration is required in production');
  }
}

module.exports = { environment };