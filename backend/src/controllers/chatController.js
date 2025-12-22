import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';

const canAccessBooking = async ({ user, bookingId }) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return { ok: false, error: 'Booking not found' };

  if (user.role === 'admin') return { ok: true, booking };

  if (user.role === 'student') {
    if (String(booking.student_id) === String(user.id)) return { ok: true, booking };
    return { ok: false, error: 'Insufficient permissions' };
  }

  if (user.role === 'tutor') {
    const tutor = await Tutor.findOne({ user_id: user.id });
    if (!tutor) return { ok: false, error: 'Tutor profile not found' };
    if (String(booking.tutor_id) === String(tutor._id)) return { ok: true, booking };
    return { ok: false, error: 'Insufficient permissions' };
  }

  return { ok: false, error: 'Insufficient permissions' };
};

export const getBookingMessages = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const { ok, error } = await canAccessBooking({ user: req.user, bookingId: booking_id });
    if (!ok) return res.status(403).json({ error });

    const messages = await Message.find({ booking_id })
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({ messages });
  } catch (e) {
    console.error('getBookingMessages error:', e);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const postBookingMessage = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { content } = req.body;

    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const { ok, error } = await canAccessBooking({ user: req.user, bookingId: booking_id });
    if (!ok) return res.status(403).json({ error });

    if (!String(content || '').trim()) {
      return res.status(400).json({ error: 'content is required' });
    }

    const msg = await Message.create({
      booking_id,
      sender_id: req.user.id,
      content: String(content).trim()
    });

    res.status(201).json({ message: msg });
  } catch (e) {
    console.error('postBookingMessage error:', e);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
