/**
 * Validates required environment variables and database configurations
 * @param {Object} env - Process environment object
 * @throws {Error} If required variables are missing or no database is configured
 */
function validateEnvConfig(env) {
  const requiredVars = [
    'PORT',
    'JWT_SECRET'
  ];

  const missingVars = requiredVars.filter(
    varName => !env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Validar que al menos haya una configuración de base de datos
  const hasDbConfig = (
    (env.PG_HOST && env.PG_DATABASE) ||
    (env.MYSQL_HOST && env.MYSQL_DATABASE)
  );

  if (!hasDbConfig) {
    throw new Error('At least one database configuration is required');
  }
}

/**
 * Helper function to check if a specific database configuration is complete
 * @param {Object} env - Process environment object
 * @param {string} dbType - Type of database to check ('mongo', 'postgres', 'mysql')
 * @returns {boolean} Whether the configuration is complete
 */
function isDbConfigComplete(env, dbType) {
  switch (dbType) {
    case 'mongo':
      return !!env.MONGO_URL;
    case 'postgres':
      return !!(env.PG_HOST && env.PG_DATABASE && env.PG_USER && env.PG_PASSWORD);
    case 'mysql':
      return !!(env.MYSQL_HOST && env.MYSQL_DATABASE && env.MYSQL_USER && env.MYSQL_PASSWORD);
    default:
      return false;
  }
}

module.exports = {
  validateEnvConfig,
  isDbConfigComplete
};