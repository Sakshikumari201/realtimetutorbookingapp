// Booking state machine: requested → accepted/rejected → completed
import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';

const buildJitsiMeetingLink = (bookingId) => {
  const room = `tutorbooking-${String(bookingId)}`;
  return `https://meet.jit.si/${encodeURIComponent(room)}`;
};

// Create booking and reserve slot
export const createBooking = async (req, res) => {
  try {
    const { tutor_id, scheduled_at } = req.body;

    if (!tutor_id || !scheduled_at) {
      return res.status(400).json({ error: 'Missing required fields: tutor_id, scheduled_at' });
    }

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can create bookings' });
    }

    const tutor = await Tutor.findById(tutor_id);
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const booking = await Booking.create({
      student_id: req.user.id,
      tutor_id,
      scheduled_at: new Date(scheduled_at),
      status: 'Pending'
    });

    res.status(201).json({
      message: 'Booking created',
      booking
    });

  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Tutor accept/reject booking
export const respondToBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { response, meeting_link: customLink } = req.body;

    if (!req.user || req.user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can respond to bookings' });
    }

    if (!['accept', 'reject'].includes(response)) {
      return res.status(400).json({ error: 'Invalid response. Must be "accept" or "reject"' });
    }

    const tutor = await Tutor.findOne({ user_id: req.user.id });
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const newStatus = response === 'accept' ? 'Approved' : 'Rejected';
    // Use custom link if provided, otherwise generate default Jitsi link
    const meeting_link = newStatus === 'Approved'
      ? (customLink || buildJitsiMeetingLink(booking_id))
      : null;

    const booking = await Booking.findOneAndUpdate(
      { _id: booking_id, tutor_id: tutor._id, status: 'Pending' },
      { status: newStatus, meeting_link },
      { new: true }
    ).populate('student_id', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or already processed' });
    }

    // Real-time notification
    try {
      const io = getIO();
      io.to(`booking:${booking_id}`).emit('booking_status_updated', {
        booking_id: String(booking_id),
        status: booking.status,
        meeting_link: booking.meeting_link || null
      });

      io.to(`user:${String(booking.student_id?._id || booking.student_id)}`).emit('notification', {
        type: 'booking_status_updated',
        booking_id: String(booking_id),
        status: booking.status,
        meeting_link: booking.meeting_link || null,
        message: `Your booking was ${booking.status}.`
      });
    } catch (e) {
      // Socket layer is optional; ignore failures so REST still works
    }

    res.json({ message: 'Booking updated', booking });
  } catch (error) {
    console.error('respondToBooking error:', error);
    res.status(500).json({ error: 'Failed to respond to booking' });
  }
};

// Get booking status (for polling)
export const getBookingStatus = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const baseBooking = await Booking.findById(booking_id);
    if (!baseBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Admin can view any booking
    if (req.user.role === 'admin') {
      const booking = await Booking.findById(booking_id)
        .populate('tutor_id', 'name subject experience')
        .populate('student_id', 'name email');
      return res.json({ booking });
    }

    // Student can view only their own bookings
    if (req.user.role === 'student') {
      if (String(baseBooking.student_id) !== String(req.user.id)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const booking = await Booking.findById(booking_id)
        .populate('tutor_id', 'name subject experience')
        .populate('student_id', 'name email');
      return res.json({ booking });
    }

    // Tutor can view only their own bookings
    if (req.user.role === 'tutor') {
      const tutor = await Tutor.findOne({ user_id: req.user.id });
      if (!tutor) {
        return res.status(404).json({ error: 'Tutor profile not found' });
      }

      if (String(baseBooking.tutor_id) !== String(tutor._id)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const booking = await Booking.findById(booking_id)
        .populate('tutor_id', 'name subject experience')
        .populate('student_id', 'name email');
      return res.json({ booking });
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  } catch (error) {
    console.error('getBookingStatus error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Get student's bookings
export const getStudentBookings = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view student bookings' });
    }

    const { status } = req.query;
    const filter = { student_id: req.user.id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('tutor_id', 'name subject experience');

    res.json({ bookings });
  } catch (error) {
    console.error('getStudentBookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get tutor's bookings
export const getTutorBookings = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can view tutor bookings' });
    }

    const tutor = await Tutor.findOne({ user_id: req.user.id });
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const { status } = req.query;
    const filter = { tutor_id: tutor._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('student_id', 'name email');

    res.json({ bookings });
  } catch (error) {
    console.error('getTutorBookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Mark booking as completed
export const completeBooking = async (req, res) => {
  try {
    return res.status(400).json({ error: 'Not implemented in this simplified workflow' });
  } catch (error) {
    console.error('completeBooking error:', error);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
};
