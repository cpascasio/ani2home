const Joi = require('joi');

  const userSchema = Joi.object({
    userId: Joi.string().optional(),
    name: Joi.string().optional(),
    userName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    dateOfBirth: Joi.date().iso().optional(),
    userProfilePic: Joi.string().optional(),
    userCover: Joi.string().optional(),
    address: Joi.object({
      fullAddress: Joi.string().optional(),
      streetAddress: Joi.string().optional(),
      city: Joi.string().optional(),
      province: Joi.string().optional(),
      barangay: Joi.string().optional(),
      region: Joi.string().optional(),
      country: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      lng: Joi.number().optional(),
      lat: Joi.number().optional(),
    }).optional(),
    phoneNumber: Joi.string().optional(),
    followers: Joi.array().items(Joi.string()).optional(),
    isStore : Joi.boolean().optional(),
    bio: Joi.string().optional(),
    isVerified: Joi.boolean().optional(),
});



  module.exports = userSchema;