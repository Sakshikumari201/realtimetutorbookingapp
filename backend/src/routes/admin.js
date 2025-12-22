import { Router } from 'express';
import {
  getAllUsers,
  deleteUser,
  getAllBookings,
  getBookingStats,
  getTutorEffectiveness,
  getSubjectTrends,
  getAlerts,
  getPlatformOverview
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken, authorizeRoles('admin'));

/**
 * GET /api/admin/users
 * View all users
 */
router.get('/users', getAllUsers);

/**
 * DELETE /api/admin/users/:user_id
 * Delete a user
 */
router.delete('/users/:user_id', deleteUser);

/**
 * GET /api/admin/bookings
 * Monitor all bookings
 */
router.get('/bookings', getAllBookings);

/**
 * GET /api/admin/overview
 * Get platform overview stats
 */
router.get('/overview', getPlatformOverview);

/**
 * GET /api/admin/stats
 * Get booking statistics
 */
router.get('/stats', getBookingStats);

/**
 * GET /api/admin/tutors
 * Get tutor effectiveness rankings
 */
router.get('/tutors', getTutorEffectiveness);

/**
 * GET /api/admin/subjects
 * Get subject trends
 */
router.get('/subjects', getSubjectTrends);

/**
 * GET /api/admin/alerts
 * Get system alerts
 */
router.get('/alerts', getAlerts);

export default router;
