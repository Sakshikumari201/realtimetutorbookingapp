import { Router } from 'express';
import bcrypt from 'bcrypt';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import { validateRequired, sanitizeInputs } from '../middleware/validation.js';
import User from '../models/User.js';
import Tutor from '../models/Tutor.js';

const router = Router();

// POST /api/auth/register
// Register with role selection (Student/Tutor/Admin)
router.post('/register', sanitizeInputs, validateRequired('name', 'email', 'password', 'role'), async (req, res) => {
  try {
    const { name, email, password, role, subject, experience, adminSecretKey } = req.body;

    const normalizedRole = String(role || '').toLowerCase();
    if (!['student', 'tutor', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be Student, Tutor, or Admin.' });
    }

    if (normalizedRole === 'admin') {
      const requiredKey = process.env.ADMIN_SECRET_KEY;
      if (!requiredKey) {
        return res.status(500).json({ error: 'Admin secret key is not configured on server' });
      }
      if (!adminSecretKey || adminSecretKey !== requiredKey) {
        return res.status(403).json({ error: 'Invalid admin secret key' });
      }
    }

    if (normalizedRole === 'tutor') {
      if (!subject || experience === undefined || experience === null || experience === '') {
        return res.status(400).json({ error: 'Tutor registration requires subject and experience' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash,
      name,
      role: normalizedRole
    });

    let tutor_id;
    if (normalizedRole === 'tutor') {
      const tutor = await Tutor.create({
        user_id: user._id,
        name,
        subject,
        experience: Number(experience)
      });
      tutor_id = tutor._id;
    }

    res.status(201).json({
      message: 'Registration successful. Please login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tutor_id
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR] Register:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
// Login must include role selection
router.post('/login', sanitizeInputs, validateRequired('email', 'password', 'role'), async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedRole = String(role || '').toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== normalizedRole) {
      return res.status(403).json({ error: 'Role mismatch. Please select the correct role.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let tutor_id;
    if (user.role === 'tutor') {
      const tutor = await Tutor.findOne({ user_id: user._id });
      tutor_id = tutor?._id;
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      tutor_id
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tutor_id
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR] Login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.toObject();
    userData.id = userData._id;

    if (user.role === 'tutor') {
      const tutor = await Tutor.findOne({ user_id: user._id });
      userData.tutor_id = tutor?._id;
    }

    res.json(userData);
  } catch (error) {
    console.error('[AUTH ERROR] Me:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
