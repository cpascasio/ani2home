const Joi = require('joi');

const now = new Date().toISOString();

const productSchema = Joi.object({
    // productId: Joi.string().guid({ version: 'uuidv4' }).required(),
    storeId: Joi.string().default(""),
    productName: Joi.string().required(),
    productDescription: Joi.string().required(),
    dateAdded: Joi.date().iso().default(now),
    rating: Joi.number().min(0).max(5).precision(1).default(0),
    isKilo: Joi.boolean().default(false),
    totalSales: Joi.number().required().default(0),
    stock: Joi.number().required(),
    price: Joi.number().precision(2).required(),
    pictures: Joi.array().items(Joi.string()).max(5).required(),
    type: Joi.string().required(),
    category: Joi.string().valid('Vegetable', 'Fruit').required()
});

module.exports = productSchema;

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

