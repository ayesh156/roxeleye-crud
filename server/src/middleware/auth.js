const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token.' });
    }
    logger.error('Auth error', { error: err.message });
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access', { userId: req.user.userId, role: req.user.role, required: roles });
      return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

const isAdmin = authorize('ADMIN');

// checks if user is admin or accessing their own resource
function isAdminOrOwner(param = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const resourceId = parseInt(req.params[param]);
    if (req.user.role === 'ADMIN' || req.user.userId === resourceId) {
      return next();
    }
    
    logger.warn('Unauthorized access', { userId: req.user.userId, resourceId });
    return res.status(403).json({ success: false, error: 'Access denied. You can only access your own resources.' });
  };
}

module.exports = { authenticate, authorize, isAdmin, isAdminOrOwner };
