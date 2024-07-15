const Joi = require('joi');

const userSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    passwordHash: Joi.string().required(),
    profilePictureUrl: Joi.string().uri(),
    dateOfBirth: Joi.string().isoDate().required(),
    addresses: Joi.array().items(Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required()
    })).required(),
    phoneNumbers: Joi.array().items(Joi.string().required()),
    preferences: Joi.object({
      newsletterSubscribed: Joi.boolean().required(),
      notifications: Joi.object({
        email: Joi.boolean().required(),
        sms: Joi.boolean().required()
      }).required()
    }).required(),
    followers: Joi.array().items(Joi.string().required()) // Array of other users' UIDs
  });

  module.exports = userSchema;