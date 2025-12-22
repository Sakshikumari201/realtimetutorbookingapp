import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getAdminStats, getStudentStats, getTutorStats, updateStreak } from '../controllers/statsController.js';

const router = Router();

// Update streak (Student only)
router.post('/streak', authenticateToken, authorizeRoles('student'), updateStreak);

// Student dashboard stats
router.get('/student', authenticateToken, authorizeRoles('student'), getStudentStats);

// Tutor dashboard stats
router.get('/tutor', authenticateToken, authorizeRoles('tutor'), getTutorStats);

// Admin dashboard stats
router.get('/admin', authenticateToken, authorizeRoles('admin'), getAdminStats);

export default router;
