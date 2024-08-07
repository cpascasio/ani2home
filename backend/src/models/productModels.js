const Joi = require('joi');

const now = new Date().toISOString();

const productSchema = Joi.object({
    // productId: Joi.string().guid({ version: 'uuidv4' }).required(),
    storeId: Joi.string().optional(),
    productName: Joi.string().optional(),
    productDescription: Joi.string().optional(),
    dateAdded: Joi.date().iso().optional(),
    rating: Joi.number().min(0).max(5).precision(1).optional(),
    isKilo: Joi.boolean().optional(),
    totalSales: Joi.number().optional(),
    stock: Joi.number().optional(),
    price: Joi.number().precision(2).optional(),
    pictures: Joi.array().items(Joi.string()).max(5).optional(),
    type: Joi.string().optional(),
    category: Joi.string().valid('Vegetable', 'Fruit').optional()
});

module.exports = productSchema;

// dateAdded
// rating
// totalSales

// modal specifications

// Name
// Description
// category (vegetable, fruit)
// create a dropdown that follows these conditions:
// if(vegetable) dropdown should have a list of vegetables
// if(fruit) dropdown should have a list of fruits

// if dropdown has selected empty, create a custom other input field.

// kilo or pieces
// price per kilo or per piece
// Stock

// add picture that displays the pictures already added to be 
