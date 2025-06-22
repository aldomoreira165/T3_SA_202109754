const { Logger } = require('./Logger');

class ResponseHandler {
  static async sendSuccess(res, data = null, message, statusCode = 200) {
    const response = {
      status: 'success',
      message,
      data,
      path: res.req.originalUrl
    };

    Logger.ok(`[${statusCode}] ${message}`);
    res.status(statusCode).json(response);
  }

  static async sendError(res, message, statusCode = 500, data = null) {
    const response = {
      status: 'error',
      message,
      data,
      path: res.req.originalUrl
    };

    Logger.error(`[${statusCode}] ${message}`, data);
    res.status(statusCode).json(response);
  }
}

// Si necesitas exponer también la interfaz ApiResponse para documentación
const ApiResponseSchema = {
  status: ['success', 'error'],
  message: 'string',
  data: 'any',
  path: 'string'
};

module.exports = {
  ResponseHandler,
  ApiResponseSchema
};