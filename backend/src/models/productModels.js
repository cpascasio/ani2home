// backend/src/models/productModels.js
const Joi = require("joi");

const idPattern = /^[a-zA-Z0-9_-]+$/;

// Accept either https://... OR data:image/...;base64,...
const PictureString = Joi.alternatives().try(
  Joi.string().uri().max(2048),
  Joi.string().pattern(/^data:image\//) // base64 data URL
);

// ---------- CREATE (strict) ----------
const productCreateValidation = Joi.object({
  storeId: Joi.string().pattern(idPattern).min(1).max(128).required().messages({
    "string.pattern.base": "storeId contains invalid characters",
    "any.required": "storeId is required",
  }),
  productName: Joi.string().trim().min(1).max(120).required(),
  productDescription: Joi.string().trim().max(2000).allow(""),
  category: Joi.string().valid("Vegetable", "Fruit").required(),
  isKilo: Joi.boolean().required(),
  price: Joi.number().precision(2).min(0).max(999999.99).required(),
  stock: Joi.number().integer().min(0).max(1000000).required(),
  type: Joi.string().trim().max(120).allow(""),
  pictures: Joi.array().items(PictureString).max(5).default([]),
}).unknown(false);

// ---------- UPDATE (partial but strict) ----------
const productUpdateValidation = Joi.object({
  productName: Joi.string().trim().min(1).max(120),
  productDescription: Joi.string().trim().max(2000).allow(""),
  category: Joi.string().valid("Vegetable", "Fruit"),
  isKilo: Joi.boolean(),
  price: Joi.number().precision(2).min(0).max(999999.99),
  stock: Joi.number().integer().min(0).max(1000000),
  type: Joi.string().trim().max(120).allow(""),
  pictures: Joi.array().items(PictureString).max(5),
})
  .min(1)
  .unknown(false);

// ---------- PARAMS ----------
const productIdParamValidation = Joi.string()
  .pattern(idPattern)
  .min(1)
  .max(128)
  .required()
  .messages({
    "string.pattern.base": "productId contains invalid characters",
    "any.required": "productId is required",
  });

module.exports = {
  productCreateValidation,
  productUpdateValidation,
  productIdParamValidation,
};
