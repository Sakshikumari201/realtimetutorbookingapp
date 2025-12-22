import { Router } from 'express';
import { submitFeedback, getStudentOutcomes, getTutorFeedback } from '../controllers/feedbackController.js';
import { sanitizeInputs, validateRequired, validateRange } from '../middleware/validation.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/feedback
 * Submit feedback for a completed session
 */
router.post('/', sanitizeInputs, validateRequired('booking_id', 'rating'), validateRange('rating', 1, 5), authenticateToken, authorizeRoles('student'), submitFeedback);

/**
 * GET /api/feedback/outcomes/:student_id
 * Get student's learning outcomes history
 */
router.get('/outcomes/:student_id', authenticateToken, authorizeRoles('student'), getStudentOutcomes);

/**
 * GET /api/feedback/tutor/:tutor_id
 * Get tutor's feedback history
 */
router.get('/tutor/me', authenticateToken, authorizeRoles('tutor'), getTutorFeedback);

export default router;
