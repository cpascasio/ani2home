const Joi = require('joi');

const cartSchema = Joi.object({
    userId: Joi.string().guid({ version: 'uuidv4' }).required(),
    productId: Joi.string().guid({ version: 'uuidv4' }).required(),
    quantity: Joi.number().integer().default(1).required()
});

module.exports = cartSchema;