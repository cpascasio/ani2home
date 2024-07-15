const Joi = require('joi');

const userSchema = Joi.object({
    userId: Joi.string().guid({ version: 'uuidv4' }).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    passwordHash: Joi.string().required(),
    dateOfBirth: Joi.date().default(() => new Date(), 'current date').iso().required(),
    userProfilePic: Joi.string().default('[DEFAULT PROFILE PIC]'),
    userCover: Joi.string().default('[DEFAULT COVER PIC]'),
    addresses: Joi.array().items(Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required()
    })).required(),
    phoneNumbers: Joi.array().items(Joi.string()).required(),
    followers: Joi.array().items(Joi.string()).default([]).required(),
    isVerified: Joi.boolean().default(false)
  });

  module.exports = userSchema;