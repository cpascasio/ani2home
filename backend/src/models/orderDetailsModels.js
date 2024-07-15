const Joi = require('joi');

const orderDetailSchema = Joi.object({
    orderId: Joi.string().guid({ version: 'uuidv4' }).required(),
    productId: Joi.string().guid({ version: 'uuidv4' }).required(),
    quantity: Joi.number().integer().default(1).required()
});

module.exports = orderDetailSchema;