const Joi = require("joi");

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
  isStore: Joi.boolean().optional(),
  bio: Joi.string().optional(),
  isVerified: Joi.boolean().optional(),

  // Authentication & Security fields - CORRECTED SYNTAX
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
        password: Joi.string().required(), // This will be the hashed password
        changedAt: Joi.date().required(),
      })
    )
    .optional(),
  lastPasswordChange: Joi.date().default(Date.now).optional(),

  // MFA fields (you already have these)
  mfaSecret: Joi.string().optional(),
  mfaEnabled: Joi.boolean().default(false).optional(),

  // Security questions
  securityQuestions: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        answer: Joi.string().required(), // This will be hashed
      })
    )
    .min(3)
    .optional(), // Require at least 3 security questions

  // Password field (for registration/updates)
  password: Joi.string().optional(), // Will be hashed before storage
});

module.exports = userSchema;
