const Joi = require("joi");


const orderSchema = Joi.object({
  userId: Joi.string().optional(),
  sellerId: Joi.string().optional(),
  shippingFee: Joi.number().min(0).optional(),
  totalPrice: Joi.number().min(0).optional(),
  status: Joi.string().optional(),
  deliveryAddress: Joi.object({
    fullName: Joi.string().optional(),
    province: Joi.string().optional(),
    barangay: Joi.string().optional(),
    city: Joi.string().optional(),
    address: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
  }).optional(),
  note: Joi.string().optional(),
  courier: Joi.string().optional(),
  shippingId: Joi.string().optional(),
  paymentOption: Joi.string().optional(),
  paymentRefNo: Joi.string().optional(),
});

module.exports = orderSchema;
