import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getBookingMessages, postBookingMessage } from '../controllers/chatController.js';

const router = Router();

router.get('/bookings/:booking_id/messages', authenticateToken, getBookingMessages);
router.post('/bookings/:booking_id/messages', authenticateToken, postBookingMessage);

export default router;
