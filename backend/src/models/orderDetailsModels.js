const Joi = require('joi');

const orderDetailSchema = Joi.object({
    orderId: Joi.string().required(),
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(0.5).required()
});

module.exports = orderDetailSchema;