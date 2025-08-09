const Joi = require("joi");

const sellerSchema = Joi.object({
  sellerId: Joi.string().guid({ version: "uuidv4" }).required(),
  sellerName: Joi.string().required(),
  sellerLoc: Joi.string().required(),
  sellerBio: Joi.string(),
  sellerProfilePic: Joi.string().default("[DEFAULT PROFILE PIC]"),
  sellerCover: Joi.string().default("[DEFAULT COVER PIC]"),
  sellerFollowers: Joi.array()
    .items(Joi.string().guid({ version: "uuidv4" }))
    .default([])
    .required(),
  sellerRating: Joi.number().precision(1).default(0).required(),
  sellerProductCount: Joi.number().integer().default(0).required(),
});

module.exports = sellerSchema;
