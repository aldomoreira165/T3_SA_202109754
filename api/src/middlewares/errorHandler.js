const { Logger } = require('../utils/Logger');

const errorHandler = (error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  Logger.error(`Error Handler: ${message}`, error);

  res.status(status).json({
    status: 'error',
    message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

module.exports = errorHandler;