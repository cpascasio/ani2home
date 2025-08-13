// placeOrderModels.js
const Joi = require("joi");

const idPattern = /^[a-zA-Z0-9_-]+$/;

const placeOrderSchema = Joi.object({
  userId: Joi.string().pattern(idPattern).min(1).max(128).required(),
  sellerId: Joi.string().pattern(idPattern).min(1).max(128).required(),
  status: Joi.string().valid("pending", "paid", "shipped", "delivered", "cancelled").required(),
  deliveryAddress: Joi.object({
    fullName: Joi.string().min(1).max(120).required(),
    province: Joi.string().min(1).max(80).required(),
    barangay: Joi.string().min(1).max(80).required(),
    city: Joi.string().min(1).max(80).required(),
    address: Joi.string().min(1).max(200).required(),
    phoneNumber: Joi.string().min(7).max(20).required(),
    lng: Joi.number().min(-180).max(180).optional(),
    lat: Joi.number().min(-90).max(90).optional(),
  }).required().unknown(false),
  note: Joi.string().max(500).allow(""),
  paymentOption: Joi.string().valid("cod", "card", "gcash").required(),
  paymentRefNo: Joi.string().max(256).allow(""),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().pattern(idPattern).min(1).max(128).required(),
        quantity: Joi.number().integer().min(1).max(999).required(),
      }).unknown(false)
    )
    .min(1)
    .max(50)
    .required(),
}).unknown(false); // reject extra fields

module.exports = placeOrderSchema;
