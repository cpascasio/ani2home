// backend/src/models/productModels.js
const Joi = require("joi");
const { id, prefs } = require("./validators/common");

const productSchema = Joi.object({
  storeId: id.required(), // match cart-style ID rules
  productName: Joi.string().min(2).max(120).required(),
  productDescription: Joi.string().min(10).max(1000).required(),
  isKilo: Joi.boolean().required(),
  stock: Joi.number().integer().min(0).max(10_000_000).required(),
  price: Joi.number().min(0).max(10_000_000).precision(2).required(),
  pictures: Joi.array().max(5).items(Joi.string().uri()).optional(),
  type: Joi.string().max(50).optional(),
  category: Joi.string().valid("Vegetable", "Fruit").required(),

  // server-managed; forbid in payload to enforce "reject, don't sanitize"
  dateAdded: Joi.forbidden(),
  rating: Joi.forbidden(),
  totalSales: Joi.forbidden(),
})
  .unknown(false)
  .prefs(prefs);

module.exports = productSchema;
