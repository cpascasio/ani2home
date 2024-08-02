const Joi = require('joi');

  const userSchema = Joi.object({
    userId: Joi.string().optional(),
    name: Joi.string().optional(),
    userName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    dateOfBirth: Joi.date().iso().optional(),
    userProfilePic: Joi.string().default('../src/assets/MyProfile pic.png'),
    userCover: Joi.string().default('https://walker-web.imgix.net/cms/Gradient_builder_2.jpg?auto=format,compress&w=1920&h=1200&fit=crop&dpr=1.5'),
    address: Joi.object({
      fulladdress: Joi.string().default(""),
      street: Joi.string().default(""),
      city: Joi.string().default(""),
      province: Joi.string().default(""),
      region: Joi.string().default(""),
      country: Joi.string().default(""),
      lng: Joi.number().default(0),
      lat: Joi.number().default(0),
    }).default(),
    phoneNumber: Joi.string().default(""),
    followers: Joi.array().items(Joi.string()).default([]),
    isStore : Joi.boolean().default(false),
    bio: Joi.string().default(""),
    isVerified: Joi.boolean().default(false)
});

  

  module.exports = userSchema;