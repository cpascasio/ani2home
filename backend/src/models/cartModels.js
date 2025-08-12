const Joi = require("joi");

// Enhanced cart schema with stricter validation for security
const cartSchema = Joi.object({
  cart: Joi.array()
    .items(
      Joi.object({
        sellerId: Joi.string()
          .required()
          .min(1)
          .max(128)
          .pattern(/^[a-zA-Z0-9_-]+$/) // Only alphanumeric, underscore, and dash
          .messages({
            "string.pattern.base": "Seller ID contains invalid characters",
            "string.min": "Seller ID must be at least 1 character",
            "string.max": "Seller ID cannot exceed 128 characters",
          }),
        items: Joi.array()
          .items(
            Joi.object({
              productId: Joi.string()
                .required()
                .min(1)
                .max(128)
                .pattern(/^[a-zA-Z0-9_-]+$/) // Only alphanumeric, underscore, and dash
                .messages({
                  "string.pattern.base":
                    "Product ID contains invalid characters",
                  "string.min": "Product ID must be at least 1 character",
                  "string.max": "Product ID cannot exceed 128 characters",
                }),
              quantity: Joi.number()
                .integer()
                .min(1)
                .max(999)
                .required()
                .messages({
                  "number.min": "Quantity must be at least 1",
                  "number.max": "Quantity cannot exceed 999",
                  "number.integer": "Quantity must be a whole number",
                }),
            }).required()
          )
          .min(1)
          .max(50) // Limit items per seller to prevent abuse
          .required()
          .messages({
            "array.min": "At least one item is required per seller",
            "array.max": "Cannot have more than 50 items per seller",
          }),
      }).required()
    )
    .max(20) // Limit total sellers in cart to prevent abuse
    .required()
    .messages({
      "array.max": "Cannot have items from more than 20 sellers in cart",
    }),
});

// Individual validation schemas for API endpoints
const addToCartValidation = Joi.object({
  userId: Joi.string()
    .required()
    .min(1)
    .max(128)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      "string.pattern.base": "User ID contains invalid characters",
      "any.required": "User ID is required",
    }),
  sellerId: Joi.string()
    .required()
    .min(1)
    .max(128)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      "string.pattern.base": "Seller ID contains invalid characters",
      "any.required": "Seller ID is required",
    }),
  productId: Joi.string()
    .required()
    .min(1)
    .max(128)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      "string.pattern.base": "Product ID contains invalid characters",
      "any.required": "Product ID is required",
    }),
  quantity: Joi.number().integer().min(1).max(999).required().messages({
    "number.min": "Quantity must be at least 1",
    "number.max": "Quantity cannot exceed 999",
    "number.integer": "Quantity must be a whole number",
    "any.required": "Quantity is required",
  }),
});

const removeFromCartValidation = Joi.object({
  userId: Joi.string()
    .required()
    .min(1)
    .max(128)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      "string.pattern.base": "User ID contains invalid characters",
      "any.required": "User ID is required",
    }),
  productId: Joi.string()
    .required()
    .min(1)
    .max(128)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      "string.pattern.base": "Product ID contains invalid characters",
      "any.required": "Product ID is required",
    }),
});

const removeSellerItemsValidation = Joi.object({
  userId: Joi.string()
    .required()
    .min(1)
    .max(128)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      "string.pattern.base": "User ID contains invalid characters",
      "any.required": "User ID is required",
    }),
  sellerId: Joi.string()
    .required()
    .min(1)
    .max(128)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      "string.pattern.base": "Seller ID contains invalid characters",
      "any.required": "Seller ID is required",
    }),
});

// Parameter validation for URL params
const userIdParamValidation = Joi.string()
  .required()
  .min(1)
  .max(128)
  .pattern(/^[a-zA-Z0-9_-]+$/)
  .messages({
    "string.pattern.base": "User ID contains invalid characters",
    "any.required": "User ID is required",
  });

const sellerIdParamValidation = Joi.string()
  .required()
  .min(1)
  .max(128)
  .pattern(/^[a-zA-Z0-9_-]+$/)
  .messages({
    "string.pattern.base": "Seller ID contains invalid characters",
    "any.required": "Seller ID is required",
  });

module.exports = {
  cartSchema,
  addToCartValidation,
  removeFromCartValidation,
  removeSellerItemsValidation,
  userIdParamValidation,
  sellerIdParamValidation,
};
