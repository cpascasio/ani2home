const Joi = require('joi');

  const userSchema = Joi.object({
    userId: Joi.string().optional(),
    name: Joi.string().optional(),
    userName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    dateOfBirth: Joi.date().iso().optional(),
    userProfilePic: Joi.string().default('../src/assets/MyProfile pic.png'),
    userCover: Joi.string().optional(),
    address: Joi.object({
      fulladdress: Joi.string().optional(),
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      province: Joi.string().optional(),
      region: Joi.string().optional(),
      country: Joi.string().optional(),
      lng: Joi.number().default(0),
      lat: Joi.number().default(0),
    }).default(),
    phoneNumber: Joi.string().optional(),
    followers: Joi.array().items(Joi.string()).default([]),
    isStore : Joi.boolean().default(false),
    bio: Joi.string().optional(),
    isVerified: Joi.boolean().default(false)
});

  

  module.exports = userSchema;