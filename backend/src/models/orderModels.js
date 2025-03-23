// const Joi = require('joi');

// const orderSchema = Joi.object({
//     orderId: Joi.string().required(),
//     orderDate: Joi.date().default(() => new Date(), 'current date').iso().required(),
//     orderStatus: Joi.string().valid('In Progress', 'Shipped', 'Disputed', 'Resolved', 'Completed').required().default('In Progress'),
//     orderPayment: Joi.string().valid('COD', 'GCash', 'Bank').required()
// });

// module.exports = orderSchema;
const Joi = require("joi");

/*

const orderSchema = Joi.object({
    userId: Joi.string().optional(),
    items: Joi.array().items(Joi.object({
      productId: Joi.string().optional(),
      quantity: Joi.number().optional()
    })).required(),
    totalPrice: Joi.number().required(),
    deliveryAddress: Joi.object({
      fullName: Joi.string().required(),
      countryCode: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      address: Joi.string().default('')
    }).required(),
    note: Joi.string().optional(),
    paymentOption: Joi.string().required()
  });


  */

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
