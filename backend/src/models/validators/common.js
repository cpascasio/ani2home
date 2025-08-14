// backend/src/models/validators/common.js
const Joi = require("joi");

// Reuse these across models to keep behavior identical to cart
const id = Joi.string().min(1).max(128).pattern(/^[a-zA-Z0-9_-]+$/);
const quantity = Joi.number().integer().min(1).max(999);
const phonePH = Joi.string().pattern(/^(09|\+639)\d{9}$/)
  .message("phoneNumber must be a valid PH mobile number");
const lat = Joi.number().min(-90).max(90);
const lng = Joi.number().min(-180).max(180);

// Collect all errors; do not coerce types
const prefs = { convert: false, abortEarly: false };

module.exports = { id, quantity, phonePH, lat, lng, prefs };
