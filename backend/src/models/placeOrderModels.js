const Joi = require("joi");

const placeOrderSchema = Joi.object({
  userId: Joi.string().required(),
  sellerId: Joi.string().required(),
  shippingFee: Joi.number().min(0).optional(),
  totalPrice: Joi.number().min(0).optional(),
  status: Joi.string().required(),
  deliveryAddress: Joi.object({
    fullName: Joi.string().optional(),
    province: Joi.string().optional(),
    barangay: Joi.string().optional(),
    city: Joi.string().optional(),
    address: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    lng: Joi.number().optional(),
    lat: Joi.number().optional(),
  }).required(),
  note: Joi.string().optional(),
  paymentOption: Joi.string().required(),
  paymentRefNo: Joi.string().optional(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().optional(),
        quantity: Joi.number().optional(),
      })
    )
    .required(),
});

module.exports = placeOrderSchema;
