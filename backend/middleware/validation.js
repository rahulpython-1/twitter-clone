import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('displayName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be 1-50 characters'),
  validate
];

export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Tweet validation rules
export const tweetValidation = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 280 })
    .withMessage('Tweet content must not exceed 280 characters'),
  body('media')
    .optional()
    .isArray({ max: 4 })
    .withMessage('Maximum 4 media files allowed'),
  validate
];

// User update validation
export const updateProfileValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be 1-50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Bio must not exceed 160 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Location must not exceed 50 characters'),
  body('website')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true; // Allow empty string
      // Allow URLs with or without protocol
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(value)) {
        throw new Error('Please provide a valid URL');
      }
      return true;
    }),
  validate
];

// ID validation
export const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];
