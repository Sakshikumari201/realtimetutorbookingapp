// JWT authentication middleware
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// Verify token from Authorization header
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[AUTH] No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('[AUTH] User authenticated:', decoded.id, decoded.role);
    next();
  } catch (error) {
    console.log('[AUTH] Invalid token:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Require specific role (simple version)
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('[AUTH] requireRole: No user on request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role) {
      console.log('[AUTH] requireRole failed:', req.user.role, 'needed:', role);
      return res.status(403).json({ 
        error: `Access denied. This action requires ${role} role.`,
        your_role: req.user.role,
        required_role: role
      });
    }

    next();
  };
};

// Role-based access control (multiple roles)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log('[AUTH] Role not in allowed list:', req.user.role, 'allowed:', allowedRoles);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Optional auth - continues without token
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Continue without auth
    }
  }

  next();
};

// Generate JWT token
export const generateToken = (user) => {
  const payload = { 
    id: user.id, 
    email: user.email, 
    name: user.name, 
    role: user.role 
  };
  
  // Include tutor_id if present
  if (user.tutor_id) {
    payload.tutor_id = user.tutor_id;
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
