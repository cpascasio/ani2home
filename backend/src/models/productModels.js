const Joi = require('joi');

const productSchema = Joi.object({
    productId: Joi.string().guid({ version: 'uuidv4' }).required(),
    storeId: Joi.string().guid({ version: 'uuidv4' }).required(),
    productName: Joi.string().required(),
    productDescription: Joi.string().required(),    
    productDate: Joi.date().default(() => new Date(), 'current date').iso().default(""),
    rating: Joi.number().min(0).max(5).precision(1).required(),
    totalSales: Joi.number().required().default(0),
    stock: Joi.number().required().default(0),
    price: Joi.number().precision(2).required().required(),
    pictures: Joi.array().items(Joi.string()).max(5).required(),
    variation: Joi.array().items(Joi.string()).default([]),
    category: Joi.string().valid('Vegetable', 'Meat', 'Fruit').required()
});

module.exports = productSchema;