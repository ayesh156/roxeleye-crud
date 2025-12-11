const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (default role is USER)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Registration failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get profile failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Get all users failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true
      }
    });

    logger.info('User role updated', { userId: id, newRole: role, updatedBy: req.user.userId });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    logger.error('Update user role failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle user active status (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate your own account'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !existingUser.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true
      }
    });

    logger.info('User status toggled', { userId: id, isActive: user.isActive, updatedBy: req.user.userId });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Toggle user status failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updateData = {};

    // Update name if provided
    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required to set a new password'
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters'
        });
      }

      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info('Profile updated', { userId });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Update profile failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    logger.info('User deleted', { userId: id, deletedBy: req.user.userId });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    logger.error('Delete user failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user avatar
const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    // Delete old avatar if exists
    if (currentUser?.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../', currentUser.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
        logger.info('Deleted old avatar', { path: currentUser.avatar });
      }
    }

    // Update user with new avatar path
    const avatarPath = `uploads/avatars/${req.file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    logger.info('Avatar updated successfully', { userId, avatar: avatarPath });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Avatar update failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete user avatar
const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get current user avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    if (!currentUser?.avatar) {
      return res.status(404).json({
        success: false,
        error: 'No avatar to delete'
      });
    }

    // Delete avatar file
    const avatarPath = path.join(__dirname, '../../', currentUser.avatar);
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
      logger.info('Deleted avatar file', { path: currentUser.avatar });
    }

    // Update user to remove avatar
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    logger.info('Avatar deleted successfully', { userId });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Avatar deletion failed', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
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
};
