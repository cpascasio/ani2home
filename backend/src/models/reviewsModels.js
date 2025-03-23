const Joi = require("joi");

const reviewSchema = Joi.object({
  reviewId: Joi.string().guid({ version: "uuidv4" }).required(),
  productId: Joi.string().guid({ version: "uuidv4" }).required(),
  userId: Joi.string().guid({ version: "uuidv4" }).required(),
  reviewBody: Joi.string(),
  date: Joi.date()
    .default(() => new Date(), "current date")
    .iso()
    .required(),
  rating: Joi.number().integer().required(),
  pictures: Joi.array().items(Joi.string()).max(5).default([]),
});

module.exports = reviewSchema;
