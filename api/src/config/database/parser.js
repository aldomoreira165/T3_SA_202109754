/**
 * @typedef {'mongo' | 'postgres' | 'mysql'} DatabaseType
 * 
 * @typedef {Object} DatabaseConfig
 * @property {DatabaseType} type - Tipo de base de datos
 * @property {string} alias - Alias para identificar la conexión
 * @property {string} [url] - URL de conexión (usado para MongoDB)
 * @property {string} [host] - Host del servidor
 * @property {number} [port] - Puerto del servidor
 * @property {string} [username] - Usuario de la base de datos
 * @property {string} [password] - Contraseña de la base de datos
 * @property {string} [database] - Nombre de la base de datos
 */

class DatabaseConfigParser {
  /**
   * Parsea las variables de entorno para encontrar configuraciones de bases de datos
   * @param {Object} env - Objeto process.env
   * @returns {DatabaseConfig[]} Array de configuraciones de bases de datos
   */
  static parse(env) {
    const configs = [];

    // Buscar todas las variables de entorno que contengan configuraciones de BD
    Object.entries(env).forEach(([key, value]) => {
      // MongoDB URLs (formato: MONGO_URL_[ALIAS])
      if (key.startsWith('MONGO_URL')) {
        const alias = key === 'MONGO_URL' ? 'default' : key.replace('MONGO_URL_', '').toLowerCase();
        configs.push({
          type: 'mongo',
          alias,
          url: value
        });
      }

      // PostgreSQL configs (formato: PG_[ALIAS]_HOST, PG_[ALIAS]_PORT, etc.)
      if (key.includes('PG_') && key.includes('_HOST')) {
        const aliasMatch = key.match(/PG_(.+)_HOST/);
        const alias = aliasMatch ? aliasMatch[1].toLowerCase() : 'default';
        const baseKey = alias === 'default' ? 'PG_' : `PG_${aliasMatch[1]}_`;

        configs.push({
          type: 'postgres',
          alias,
          host: env[`${baseKey}HOST`],
          port: parseInt(env[`${baseKey}PORT`] || '5432', 10),
          username: env[`${baseKey}USER`],
          password: env[`${baseKey}PASSWORD`],
          database: env[`${baseKey}DATABASE`]
        });
      }

      // MySQL configs (formato: MYSQL_[ALIAS]_HOST, MYSQL_[ALIAS]_PORT, etc.)
      if (key.includes('MYSQL_') && key.includes('_HOST')) {
        const aliasMatch = key.match(/MYSQL_(.+)_HOST/);
        const alias = aliasMatch ? aliasMatch[1].toLowerCase() : 'default';
        const baseKey = alias === 'default' ? 'MYSQL_' : `MYSQL_${aliasMatch[1]}_`;

        configs.push({
          type: 'mysql',
          alias,
          host: env[`${baseKey}HOST`],
          port: parseInt(env[`${baseKey}PORT`] || '3306', 10),
          username: env[`${baseKey}USER`] || '',
          password: env[`${baseKey}PASSWORD`],
          database: env[`${baseKey}DATABASE`]
        });
      }
    });

    return configs;
  }
}

module.exports = { DatabaseConfigParser };