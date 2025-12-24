import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Booking from './models/Booking.js';
import Tutor from './models/Tutor.js';
import Message from './models/Message.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

let io;

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

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(String(token), JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (e) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    // Personal room for notifications
    socket.join(`user:${user.id}`);

    socket.on('join_booking', async ({ booking_id }) => {
      try {
        const { ok, error } = await canAccessBooking({ user, bookingId: booking_id });
        if (!ok) {
          socket.emit('error_message', { error });
          return;
        }
        socket.join(`booking:${booking_id}`);
        socket.emit('joined_booking', { booking_id });
      } catch (e) {
        socket.emit('error_message', { error: 'Failed to join booking room' });
      }
    });

    socket.on('typing', async ({ booking_id }) => {
      if (!booking_id) return;
      const { ok } = await canAccessBooking({ user, bookingId: booking_id });
      if (!ok) return;
      socket.to(`booking:${booking_id}`).emit('user_typing', { booking_id, sender_id: user.id });
    });

    socket.on('send_message', async ({ booking_id, content }) => {
      try {
        if (!booking_id || !String(content || '').trim()) {
          socket.emit('error_message', { error: 'Missing booking_id or content' });
          return;
        }

        const { ok } = await canAccessBooking({ user, bookingId: booking_id });
        if (!ok) {
          socket.emit('error_message', { error: 'Insufficient permissions' });
          return;
        }

        const msg = await Message.create({
          booking_id,
          sender_id: user.id,
          content: String(content).trim()
        });

        io.to(`booking:${booking_id}`).emit('receive_message', {
          _id: msg._id,
          booking_id: msg.booking_id,
          sender_id: String(msg.sender_id),
          content: msg.content,
          createdAt: msg.createdAt
        });
      } catch (e) {
        socket.emit('error_message', { error: 'Failed to send message' });
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
