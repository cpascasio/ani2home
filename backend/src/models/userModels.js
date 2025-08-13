const Joi = require("joi");

const userSchema = Joi.object({
  userId: Joi.string().optional(),
  uid: Joi.string().optional(), // Accept both uid and userId for flexibility
  name: Joi.string().optional(),
  userName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  dateOfBirth: Joi.date().iso().optional(),
  userProfilePic: Joi.string().allow("").optional(),
  userCover: Joi.string().allow("").optional(),
  address: Joi.object({
    fullAddress: Joi.string().allow("").optional(),
    streetAddress: Joi.string().allow("").optional(),
    city: Joi.string().allow("").optional(),
    province: Joi.string().allow("").optional(),
    barangay: Joi.string().allow("").optional(),
    region: Joi.string().allow("").optional(),
    country: Joi.string().allow("").optional(),
    postalCode: Joi.string().allow("").optional(),
    lng: Joi.number().optional(),
    lat: Joi.number().optional(),
  }).optional(),
  phoneNumber: Joi.string().allow("").optional(),
  followers: Joi.array().items(Joi.string()).optional(),
  isStore: Joi.boolean().optional(),
  bio: Joi.string().allow("").optional(),
  isVerified: Joi.boolean().optional(),

  // Authentication & Security fields
  failedLoginAttempts: Joi.number().integer().min(0).default(0).optional(),
  accountLockedUntil: Joi.date().allow(null).optional(),
  lastLoginAttempt: Joi.date().allow(null).optional(),
  lastSuccessfulLogin: Joi.date().allow(null).optional(),
  lastFailedLogin: Joi.date().allow(null).optional(),
  loginHistory: Joi.array()
    .items(
      Joi.object({
        timestamp: Joi.date().required(),
        success: Joi.boolean().required(),
        ipAddress: Joi.string().ip().optional(),
        userAgent: Joi.string().optional(),
      })
    )
    .optional(),
  passwordHistory: Joi.array()
    .items(
      Joi.object({
        password: Joi.string().required(),
        changedAt: Joi.date().required(),
      })
    )
    .optional(),
  lastPasswordChange: Joi.date().default(Date.now).optional(),

  // MFA fields
  mfaSecret: Joi.string().optional(),
  mfaEnabled: Joi.boolean().default(false).optional(),

  // Security questions
  securityQuestions: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        answer: Joi.string().required(),
      })
    )
    .min(3)
    .optional(),

  // Password field
  password: Joi.string().optional(),
});

module.exports = userSchema;
