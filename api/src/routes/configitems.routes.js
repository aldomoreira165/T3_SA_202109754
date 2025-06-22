const { Router } = require('express');
const { ConfigItemsController } = require('../controllers/configitems.controller');

const router = Router();
const controller = new ConfigItemsController();

const routes = {
  getById: '/get-byId/:id',
  filter: '/filter',
  create: '/create',
  createHierarchy: '/create-hierarchy',
  update: '/update/:id',
  delete: '/delete/:id'
};

router.get(routes.getById, controller.getById.bind(controller));
router.get(routes.filter, controller.getAll.bind(controller));
router.post(routes.create, controller.create.bind(controller));
router.post(routes.createHierarchy, controller.createHierarchy.bind(controller));
router.put(routes.update, controller.update.bind(controller));
router.delete(routes.delete, controller.delete.bind(controller));

module.exports = { configItemsRoutes: router };