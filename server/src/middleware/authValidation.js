const { body, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));

    logger.warn('Auth validation failed', {
      path: req.path,
      method: req.method,
      errors: formattedErrors
    });

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors
    });
  }

  next();
};

// Registration validation
const registerValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  handleValidationErrors
];

// Login validation
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Update role validation
const updateRoleValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['ADMIN', 'USER'])
    .withMessage('Role must be either ADMIN or USER'),

  handleValidationErrors
];

// User ID validation
const userIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),

  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  updateRoleValidation,
  userIdValidation,
  handleValidationErrors
};
