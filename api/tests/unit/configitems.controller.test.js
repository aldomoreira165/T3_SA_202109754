const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { configItemsRoutes } = require('../../src/routes/configitems.routes');
const CIService = require('../../src/services/configitems.service');

jest.mock('../../src/services/configitems.service');

describe('ConfigItems API Endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());

    const router = express.Router();
    router.use('/config-items', configItemsRoutes);
    app.use('', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /config-items/create', () => {
    it('should create a CI successfully', async () => {
      const newCI = { ci_id: 1, name: 'TestCI' };
      CIService.createCI.mockResolvedValue(newCI);

      const response = await request(app)
        .post('/config-items/create')
        .send({ type_id: 1, name: 'TestCI', environment: 'DEV' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({
        success: true,
        data: newCI,
        message: 'CI created successfully'
      }));
      expect(CIService.createCI).toHaveBeenCalledWith({ type_id: 1, name: 'TestCI', environment: 'DEV' });
    });

    it('should return 400 on validation error', async () => {
      const response = await request(app)
        .post('/config-items/create')
        .send({ name: 'NoTypeId' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(CIService.createCI).not.toHaveBeenCalled();
    });
  });

  describe('GET /config-items/filter', () => {
    it('should retrieve all CIs with filters', async () => {
      const cisList = [{ ci_id: 1 }, { ci_id: 2 }];
      CIService.getAllCIs.mockResolvedValue(cisList);

      const response = await request(app)
        .get('/config-items/filter')
        .query({ environment: 'PROD' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(cisList);
      expect(CIService.getAllCIs).toHaveBeenCalledWith({ environment: 'PROD' });
    });

    it('should handle service errors gracefully', async () => {
      CIService.getAllCIs.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/config-items/filter');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /config-items/get-byId/:id', () => {
    it('should retrieve a CI by ID', async () => {
      const ci = { ci_id: 1, name: 'CI1' };
      CIService.getCIById.mockResolvedValue(ci);

      const response = await request(app).get('/config-items/get-byId/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(ci);
      expect(CIService.getCIById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if CI not found', async () => {
      CIService.getCIById.mockResolvedValue(null);

      const response = await request(app).get('/config-items/get-byId/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /config-items/update/:id', () => {
    it('should update a CI successfully', async () => {
      const updatedCI = { ci_id: 1, status: 'Updated' };
      CIService.updateCI.mockResolvedValue(updatedCI);

      const response = await request(app)
        .put('/config-items/update/1')
        .send({ status: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(updatedCI);
      expect(CIService.updateCI).toHaveBeenCalledWith('1', { status: 'Updated' });
    });

    it('should return 400 on validation error', async () => {
      const response = await request(app)
        .put('/config-items/update/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(CIService.updateCI).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /config-items/delete/:id', () => {
    it('should delete a CI successfully', async () => {
      CIService.deleteCI.mockResolvedValue();

      const response = await request(app).delete('/config-items/delete/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(CIService.deleteCI).toHaveBeenCalledWith('1');
    });

    it('should handle delete errors', async () => {
      CIService.deleteCI.mockRejectedValue(new Error('Delete error'));

      const response = await request(app).delete('/config-items/delete/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /config-items/create-hierarchy', () => {
    it('should create a hierarchy successfully', async () => {
      const rel = { hierarchy_id: 1, parent_id: 1, child_id: 2, hierarchy_type: 'hosts' };
      CIService.createHierarchy.mockResolvedValue(rel);

      const response = await request(app)
        .post('/config-items/create-hierarchy')
        .send({ parent_id: 1, child_id: 2, hierarchy_type: 'hosts' });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(rel);
      expect(CIService.createHierarchy).toHaveBeenCalledWith({ parent_id: 1, child_id: 2, hierarchy_type: 'hosts' });
    });

    it('should return 400 on validation error', async () => {
      const response = await request(app)
        .post('/config-items/create-hierarchy')
        .send({ parent_id: 1 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(CIService.createHierarchy).not.toHaveBeenCalled();
    });
  });
});
