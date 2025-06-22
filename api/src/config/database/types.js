/**
 * @typedef {'mongo' | 'postgres' | 'mysql'} DatabaseType
 */

/**
 * @typedef {Object} DatabaseConfig
 * @property {DatabaseType} type - Tipo de base de datos
 * @property {string} alias - Identificador único para la conexión
 * @property {string} [url] - URL de conexión (opcional)
 * @property {string} [host] - Host del servidor (opcional)
 * @property {number} [port] - Puerto del servidor (opcional)
 * @property {string} [username] - Usuario de la base de datos (opcional)
 * @property {string} [password] - Contraseña de la base de datos (opcional)
 * @property {string} [database] - Nombre de la base de datos (opcional)
 */

module.exports = {};