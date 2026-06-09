const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Validation rules
const registerValidation = [
  body('fullname').notEmpty().withMessage('Fullname is required.').trim(),
  body('email').isEmail().withMessage('Must be a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
];

const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('Old password is required.'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long.')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, upload.single('avatar'), authController.updateProfile);
router.put('/change-password', verifyToken, changePasswordValidation, authController.changePassword);

module.exports = router;
