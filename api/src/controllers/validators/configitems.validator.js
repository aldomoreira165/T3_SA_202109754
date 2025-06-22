const Joi = require('joi');

const envEnum = ['DEV', 'QA', 'PROD'];

const createCISchema = Joi.object({
    type_id: Joi.number().integer().required(),
    name: Joi.string().max(200).required(),
    description: Joi.string().allow('').max(1000),
    serial_number: Joi.string().max(100).allow(null, ''),
    version: Joi.string().max(50).allow(null, ''),
    acquisition_date: Joi.date().iso().allow(null),
    status: Joi.string().max(50).allow(null, ''),
    physical_location: Joi.string().max(100).allow(null, ''),
    owner: Joi.string().max(100).allow(null, ''),
    environment: Joi.string().valid(...envEnum).required(),
    security_level: Joi.string().max(50).allow(null, ''),
    license_number: Joi.string().max(100).allow(null, ''),
    license_expiration: Joi.date().iso().allow(null)
});

const updateCISchema = Joi.object({
    type_id: Joi.number().integer(),
    name: Joi.string().max(200),
    description: Joi.string().max(1000).allow(''),
    serial_number: Joi.string().max(100).allow(null, ''),
    version: Joi.string().max(50).allow(null, ''),
    acquisition_date: Joi.date().iso().allow(null),
    status: Joi.string().max(50).allow(null, ''),
    physical_location: Joi.string().max(100).allow(null, ''),
    owner: Joi.string().max(100).allow(null, ''),
    environment: Joi.string().valid(...envEnum),
    security_level: Joi.string().max(50).allow(null, ''),
    license_number: Joi.string().max(100).allow(null, ''),
    license_expiration: Joi.date().iso().allow(null)
})
    .min(1);

const createHierarchySchema = Joi.object({
    parent_id: Joi.number().integer().required(),
    child_id: Joi.number().integer().required(),
    hierarchy_type: Joi.string().max(50).required()
});

module.exports = {
    createCISchema,
    updateCISchema,
    createHierarchySchema,
};
