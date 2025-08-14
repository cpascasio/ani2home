// backend/src/models/productModels.js
const Joi = require("joi");
const { id, prefs } = require("./validators/common");

const productSchema = Joi.object({
  // productId: Joi.string().guid({ version: 'uuidv4' }).required(),
  id: Joi.string().optional(),
  productId: Joi.string().optional(),
  unit: Joi.string().optional(),
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
  category: Joi.string().valid("Vegetable", "Fruit").optional(),
});

module.exports = productSchema;
