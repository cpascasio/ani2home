const Joi = require("joi");

const cartSchema = Joi.object({
  cart: Joi.array()
    .items(
      Joi.object({
        sellerId: Joi.string().optional(),
        items: Joi.array()
          .items(
            Joi.object({
              productId: Joi.string().optional(),
              quantity: Joi.number().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

module.exports = cartSchema;
