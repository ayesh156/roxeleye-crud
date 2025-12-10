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
        
        logger.warn('Validation failed', {
            path: req.path,
            method: req.method,
            errors: formattedErrors,
            body: req.body
        });
        
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: formattedErrors
        });
    }
    
    next();
};

// Validation rules for creating an item
const createItemValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Item name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Item name must be between 2 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    body('quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer'),
    
    handleValidationErrors
];

// Validation rules for updating an item
const updateItemValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid item ID'),
    
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Item name cannot be empty')
        .isLength({ min: 2, max: 100 })
        .withMessage('Item name must be between 2 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    body('quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer'),
    
    handleValidationErrors
];

// Validation rules for item ID parameter
const itemIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid item ID'),
    
    handleValidationErrors
];

module.exports = {
    createItemValidation,
    updateItemValidation,
    itemIdValidation,
    handleValidationErrors
};
