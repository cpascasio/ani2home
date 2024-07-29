const Joi = require('joi');

  const userSchema = Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().default(""),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    dateOfBirth: Joi.date().iso().default(""),
    userProfilePic: Joi.string().default('../src/assets/MyProfile pic.png'),
    userCover: Joi.string().default('https://walker-web.imgix.net/cms/Gradient_builder_2.jpg?auto=format,compress&w=1920&h=1200&fit=crop&dpr=1.5'),
    address: Joi.string().default(""),
    phoneNumber: Joi.string().default(""),
    followers: Joi.array().items(Joi.string()).default([]),
    isStore : Joi.boolean().default(false),
    bio: Joi.string().default(""),
    isVerified: Joi.boolean().default(false)
});

  

  module.exports = userSchema;