const Server = require('./server');
const { Logger } = require('./utils/Logger');

const server = new Server();

process.on('unhandledRejection', (error) => {
  Logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

server.start().catch((error) => {
  Logger.error('Failed to start server:', error);
  process.exit(1);
});