const Joi = require('joi');

const orderSchema = Joi.object({
    orderId: Joi.string().guid({ version: 'uuidv4' }).required(),
    orderDate: Joi.date().default(() => new Date(), 'current date').iso().required(),
    orderStatus: Joi.string().valid('In Progress', 'Shipped', 'Disputed', 'Resolved', 'Completed').required().default('In Progress'),
    orderPayment: Joi.string().valid('COD', 'GCash', 'Bank').required()
});

module.exports = orderSchema;