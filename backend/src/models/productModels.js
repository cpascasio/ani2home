// models/productModels.js
const Joi = require("joi");

const idPattern = /^[a-zA-Z0-9_-]+$/;

/**
 * Create: strict schema (reject unknown fields).
 * Required fields reflect your current UI (adjust if needed).
 * - No sanitizing: .unknown(false) + validate(..., { stripUnknown:false })
 */
const productCreateValidation = Joi.object({
  storeId: Joi.string().min(1).max(128).pattern(idPattern).required().messages({
    "string.pattern.base": "storeId contains invalid characters",
    "any.required": "storeId is required",
  }),
  productName: Joi.string().trim().min(1).max(120).required(),
  productDescription: Joi.string().trim().max(2000).allow(""),
  category: Joi.string().valid("Vegetable", "Fruit").required(),
  // whether priced per kilo or per piece
  isKilo: Joi.boolean().required(),
  price: Joi.number().precision(2).min(0).max(999999.99).required(),
  stock: Joi.number().integer().min(0).max(1000000).required(),
  type: Joi.string().trim().max(120).allow(""), // optional subtype (e.g., variety)
  // accept HTTPS URLs; if you send data URIs, change to .pattern(/^data:image\//)
  pictures: Joi.array().items(Joi.string().uri().max(2048)).max(5),
})
  .unknown(false);

/**
 * Update: allow partial, still reject unknowns.
 */
const productUpdateValidation = Joi.object({
  productName: Joi.string().trim().min(1).max(120),
  productDescription: Joi.string().trim().max(2000).allow(""),
  category: Joi.string().valid("Vegetable", "Fruit"),
  isKilo: Joi.boolean(),
  price: Joi.number().precision(2).min(0).max(999999.99),
  stock: Joi.number().integer().min(0).max(1000000),
  type: Joi.string().trim().max(120).allow(""),
  pictures: Joi.array().items(Joi.string().uri().max(2048)).max(5),
})
  .min(1)
  .unknown(false);

/**
 * Params validation
 */
const productIdParamValidation = Joi.string()
  .required()
  .min(1)
  .max(128)
  .pattern(idPattern)
  .messages({
    "string.pattern.base": "productId contains invalid characters",
    "any.required": "productId is required",
  });

module.exports = {
  productCreateValidation,
  productUpdateValidation,
  productIdParamValidation,
};
