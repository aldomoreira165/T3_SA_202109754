const CIService = require('../services/configitems.service');
const { createCISchema, updateCISchema, createHierarchySchema } = require('./validators/configitems.validator');
const { ResponseHandler } = require('../utils/responses');
const { sendSuccess, sendError } = ResponseHandler;

class ConfigItemsController {
    async create(req, res) {
        try {
            const { error, value } = createCISchema.validate(req.body);
            if (error) {
                sendError(res, `Validation error: ${error.message}`, 400);
                return;
            }

            const newCI = await CIService.createCI(value);
            return sendSuccess(res, newCI, 'CI created successfully', 201);
        } catch (err) {
            return sendError(res, 'Something failed when creating the CI!', 500);
        }
    }

    async getAll(req, res) {
        try {
            const filters = req.query;

            const cis = await CIService.getAllCIs(filters);
            return sendSuccess(res, cis, 'CIs retrieved successfully', 200);
        } catch (err) {
            return sendError(res, 'Internal server error when retrieving CIs', 500);
        }
    }

    async getById(req, res) {
        try {
            const ciId = req.params.id;
            const ci = await CIService.getCIById(ciId);
            if (!ci) {
                return sendError(res, 'CI not found', 404);
            }
            return sendSuccess(res, ci, 'CI retrieved successfully', 200);
        } catch (err) {
            return sendError(res, 'Internal server error when retrieving CI', 500);
        }
    }

    async update(req, res) {
        try {
            const ciId = req.params.id;
            const { error, value } = updateCISchema.validate(req.body);
            if (error) {
                sendError(res, `Validation error: ${error.message}`, 400);
                return;
            }

            const updated = await CIService.updateCI(ciId, value);
            return sendSuccess(res, updated, 'CI updated successfully', 200);
        } catch (err) {
            return sendError(res, 'Internal server error when updating CI', 500);
        }
    }

    async delete(req, res) {
        try {
            const ciId = req.params.id;
            await CIService.deleteCI(ciId);
            return sendSuccess(res, null, 'CI deleted successfully', 200);
        } catch (err) {
            return sendError(res, 'Internal server error when deleting CI', 500);
        }
    }

    async createHierarchy(req, res) {
    try {
      const { error, value } = createHierarchySchema.validate(req.body);
      if (error) {
        sendError(res, `Validation error: ${error.message}`, 400);
        return;
      }
      const rel = await CIService.createHierarchy(value);
      return sendSuccess(res, rel, 'Relationship created successfully', 201);
    } catch (err) {
      return sendError(res, 'Error creating relationship', 500);
    }
  }
}

module.exports = {
    ConfigItemsController
};
