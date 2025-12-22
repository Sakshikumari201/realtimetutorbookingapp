import { Router } from 'express';
import {
  createBooking,
  respondToBooking,
  getBookingStatus,
  getStudentBookings,
  getTutorBookings,
  completeBooking
} from '../controllers/bookingController.js';
import { sanitizeInputs, validateStatusTransition } from '../middleware/validation.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/bookings
 * Create a new booking request
 */
router.post('/', sanitizeInputs, authenticateToken, authorizeRoles('student'), createBooking);

/**
 * POST /api/bookings/:booking_id/respond
 * Tutor responds to a booking (accept/reject)
 */
router.post('/:booking_id/respond', sanitizeInputs, validateStatusTransition, authenticateToken, authorizeRoles('tutor'), respondToBooking);

/**
 * POST /api/bookings/:booking_id/complete
 * Mark a booking as completed
 */
router.post('/:booking_id/complete', authenticateToken, completeBooking);

/**
 * GET /api/bookings/my
 * Get all bookings for logged-in student
 */
router.get('/my', authenticateToken, authorizeRoles('student'), getStudentBookings);

/**
 * GET /api/bookings/tutor
 * Get all bookings for logged-in tutor
 */
router.get('/tutor', authenticateToken, authorizeRoles('tutor'), getTutorBookings);

/**
 * GET /api/bookings/:booking_id
 * Get booking status (for polling)
 */
router.get('/:booking_id', authenticateToken, getBookingStatus);

export default router;
