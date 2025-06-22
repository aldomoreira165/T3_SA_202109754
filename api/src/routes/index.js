const { Router } = require('express');
const { configItemsRoutes } = require('./configitems.routes');
const { ResponseHandler } = require('../utils/responses');
const { sendError } = ResponseHandler;

const initializeRoutes = (app) => {
  const apiRouter = Router();

  apiRouter.use('/config-items', configItemsRoutes);

  app.use('', apiRouter);

  app.use('*', (req, res) => {
    sendError(res, `Route ${req.originalUrl} not found`, 404);
  });
};
module.exports = { initializeRoutes };