const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
  updateRoleValidation,
  userIdValidation
} = require('../middleware/authValidation');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError, processAvatar } = require('../middleware/upload');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes (require authentication)
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), handleUploadError, processAvatar, updateAvatar);
router.delete('/avatar', authenticate, deleteAvatar);

// Admin only routes
router.get('/users', authenticate, isAdmin, getAllUsers);
router.patch('/users/:id/role', authenticate, isAdmin, updateRoleValidation, updateUserRole);
router.patch('/users/:id/status', authenticate, isAdmin, userIdValidation, toggleUserStatus);
router.delete('/users/:id', authenticate, isAdmin, userIdValidation, deleteUser);

module.exports = router;
