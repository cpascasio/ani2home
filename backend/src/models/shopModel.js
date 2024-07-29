const Joi = require('joi');

const shopSchema = Joi.object({
    shopId: Joi.string().required(),
    shopName: Joi.string().required(),
    shopOwner: Joi.string().required(),
    shopEmail: Joi.string().email().required(),
    shopAddress: Joi.string().required(),
    shopPhoneNumber: Joi.array().items(Joi.string()).required(),
    shopCategory: Joi.string().required(),
    shopDescription: Joi.string().required(),
    shopRating: Joi.number().default(0),
    shopReviews: Joi.array().items(Joi.string()).default([]),
    shopProducts: Joi.array().items(Joi.string()).default([]),
    shopCover: Joi.string().default('https://walker-web.imgix.net/cms/Gradient_builder_2.jpg?auto=format,compress&w=1920&h=1200&fit=crop&dpr=1.5'),
    shopProfilePic: Joi.string().default('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1200px-Default_pfp.svg.png'),
    isVerified: Joi.boolean().default(false)
  });

  module.exports = shopSchema;