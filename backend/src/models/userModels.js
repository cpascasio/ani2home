const Joi = require('joi');

  const userSchema = Joi.object({
    userId: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    dateOfBirth: Joi.date().iso().required(),
    userProfilePic: Joi.string().default('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1200px-Default_pfp.svg.png'),
    userCover: Joi.string().default('https://walker-web.imgix.net/cms/Gradient_builder_2.jpg?auto=format,compress&w=1920&h=1200&fit=crop&dpr=1.5'),
    address: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    followers: Joi.array().items(Joi.string()).default([]),
    isVerified: Joi.boolean().default(false)
});

  

  module.exports = userSchema;