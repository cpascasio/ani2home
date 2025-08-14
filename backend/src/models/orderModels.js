// backend/src/models/orderModels.js
const Joi = require("joi");
const { id, phonePH, lat, lng, prefs } = require("./validators/common");

const deliveryAddressSchema = Joi.object({
  fullName: Joi.string().min(1).max(100).required(),
  province: Joi.string().min(2).max(100).required(),
  barangay: Joi.string().min(2).max(100).required(),
  city: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(200).required(),
  phoneNumber: phonePH.required(),
  lat: lat.required(),
  lng: lng.required(),
}).unknown(false);

const orderSchema = Joi.object({
  userId: id.required(),
  sellerId: id.required(),
  shippingFee: Joi.number().min(0).precision(2).required(),
  totalPrice: Joi.number().min(0).precision(2).required(),
  status: Joi.string()
    .valid("pending","paid","processing","shipped","delivered","cancelled")
    .required(),
  paymentOption: Joi.string().valid("COD","GCash","Card").required(),
  paymentRefNo: Joi.string().max(64)
    .when("paymentOption", { is: "COD", then: Joi.forbidden(), otherwise: Joi.required() }),
  deliveryAddress: deliveryAddressSchema.required(),
  note: Joi.string().max(500).allow("").optional(),
  courier: Joi.string().max(50).optional(),
  shippingId: Joi.string().max(64).optional(),
})
  .unknown(false)
  .prefs(prefs);

module.exports = orderSchema;
