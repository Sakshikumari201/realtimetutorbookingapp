import { Router } from 'express';
import { getTutorsByQuery, getTutorById, getAllTutors } from '../controllers/tutorController.js';
import { sanitizeInputs } from '../middleware/validation.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/tutors/search
 * Search tutors with matching algorithm
 */
// Search tutors
router.post('/search', getTutorsByQuery);

/**
 * GET /api/tutors
 * Get all active tutors
 */
router.get('/', getAllTutors);

/**
 * GET /api/tutors/:tutor_id
 * Get single tutor by ID
 */
router.get('/:tutor_id', getTutorById);

export default router;
