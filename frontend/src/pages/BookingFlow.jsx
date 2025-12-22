// Booking management page with Heroicons
import React, { useState, useEffect } from 'react';
import { useBookingResponse } from '../hooks/useBooking';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/Chat/ChatBox';
import {
  CalendarDaysIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { EnvelopeIcon, CurrencyRupeeIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const BookingFlow = () => {
  const [view, setView] = useState('student');
  const [studentBookings, setStudentBookings] = useState([]);
  const [tutorBookings, setTutorBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatBooking, setActiveChatBooking] = useState(null);

  const { user } = useAuth();
  const { socket } = useSocket();
  const { respondToBooking, loading: responding } = useBookingResponse();

  useEffect(() => {
    fetchBookings();

    if (socket) {
      socket.on('booking_updated', (updatedBooking) => {
        // Update both lists
        setStudentBookings(prev =>
          prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
        );
        setTutorBookings(prev =>
          prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
        );
      });

      socket.on('booking_request', (newBooking) => {
        if (user.role === 'tutor') {
          setTutorBookings(prev => [newBooking, ...prev]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('booking_updated');
        socket.off('booking_request');
      }
    };
  }, [socket, user.role]);

  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // In a real app, the backend should filter by the logged-in user from the token.
      // But adhering to the existing API structure:
      let endpoint = '';
      if (user.role === 'student') {
        endpoint = `${API_URL}/bookings/student/${user.id}`;
      } else if (user.role === 'tutor') {
        // Assuming tutor object has the same ID as user for simplicity, 
        // OR the backend endpoints handles 'user_id' -> 'tutor_id' resolution.
        // Based on init.js, User and Tutor models are separate.
        // We need the tutor_id corresponding to this user.
        // For now, let's assume the API might need adjustment or we use user.tutor_id if available.
        // Let's rely on the auth context providing tutor_id if role is tutor.
        const idToUse = user.tutor_id || user.id;
        endpoint = `${API_URL}/bookings/tutor/${idToUse}`;
      } else {
        setLoading(false);
        return;
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      if (user.role === 'student') {
        setStudentBookings(data.bookings || []);
        // Clear other view if switching roles implies toggle, but for now just load what's needed
      } else {
        setTutorBookings(data.bookings || []);
      }

    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (bookingId, response) => {
    const result = await respondToBooking(bookingId, tutorId, response);
    if (result) fetchBookings();
  };

  const getStatusBadge = (status) => {
    const classes = {
      requested: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-error',
      completed: 'badge-primary',
      cancelled: 'badge-error',
    };
    return `badge ${classes[status] || 'badge-primary'}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-8 relative">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <CalendarDaysIcon className="w-8 h-8 text-primary-light" />
          Booking Management
        </h1>
        <p className="text-text-muted">View and manage your tutoring sessions</p>
      </header>

      {/* View Toggle */}
      <div className="flex p-1 bg-bg-card border border-gray-700 rounded-xl mb-8">
        <button
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2
            ${view === 'student' ? 'bg-gradient-to-r from-primary to-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
          onClick={() => setView('student')}
        >
          <UserIcon className="w-5 h-5" />
          Student View
        </button>
        <button
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2
            ${view === 'tutor' ? 'bg-gradient-to-r from-primary to-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
          onClick={() => setView('tutor')}
        >
          <AcademicCapIcon className="w-5 h-5" />
          Tutor View
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-12 gap-4">
          <ArrowPathIcon className="w-12 h-12 text-primary animate-spin" />
          <p className="text-text-muted">Loading bookings...</p>
        </div>
      ) : (
        <>
          {/* Student View */}
          {view === 'student' && (
            <div>
              <h2 className="text-xl font-bold mb-6">My Bookings</h2>
              {studentBookings.length === 0 ? (
                <div className="card text-center py-12">
                  <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                  <h3 className="text-xl font-bold mb-2">No Bookings Yet</h3>
                  <p className="text-text-muted">Book a tutor to get started!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {studentBookings.map(booking => (
                    <div key={booking.id} className="card p-5 relative">
                      <button
                        onClick={() => setActiveChatBooking(booking)}
                        className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-700 text-indigo-400 transition-colors"
                        title="Chat with Tutor"
                      >
                        <ChatBubbleLeftIcon className="w-6 h-6" />
                      </button>

                      <div className="flex justify-between items-center mb-4 mr-10">
                        <span className={getStatusBadge(booking.status)}>{booking.status}</span>
                        <span className="text-sm text-text-muted">#{booking.id}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={booking.tutor_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.tutor_name}`}
                            alt={booking.tutor_name}
                            className="w-9 h-9 rounded-full"
                          />
                          <div>
                            <strong>{booking.tutor_name}</strong>
                            <span className="text-text-muted"> · {booking.subject}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {formatDate(booking.time_slot)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <CurrencyRupeeIcon className="w-4 h-4" />
                          ₹{booking.hourly_rate} · {booking.duration_minutes} min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tutor View */}
          {view === 'tutor' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Booking Requests</h2>
              {tutorBookings.length === 0 ? (
                <div className="card text-center py-12">
                  <EnvelopeIcon className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                  <h3 className="text-xl font-bold mb-2">No Requests</h3>
                  <p className="text-text-muted">You have no booking requests</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {tutorBookings.map(booking => (
                    <div key={booking.id} className="card p-5 relative">
                      <button
                        onClick={() => setActiveChatBooking(booking)}
                        className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-700 text-indigo-400 transition-colors"
                        title="Chat with Student"
                      >
                        <ChatBubbleLeftIcon className="w-6 h-6" />
                      </button>

                      <div className="flex justify-between items-center mb-4 mr-10">
                        <span className={getStatusBadge(booking.status)}>{booking.status}</span>
                        <span className="text-sm text-text-muted">#{booking.id}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-primary-light" />
                          <strong>{booking.student_name}</strong>
                          <span className="text-sm text-text-muted">{booking.student_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <AcademicCapIcon className="w-4 h-4" />
                          {booking.subject}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {formatDate(booking.time_slot)}
                        </div>
                        {booking.notes && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            {booking.notes}
                          </div>
                        )}
                      </div>
                      {booking.status === 'requested' && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700">
                          <button
                            className="btn btn-secondary flex-1"
                            onClick={() => handleRespond(booking.id, 'reject')}
                            disabled={responding}
                          >
                            <XMarkIcon className="w-5 h-5" />
                            Decline
                          </button>
                          <button
                            className="btn btn-primary flex-1"
                            onClick={() => handleRespond(booking.id, 'accept')}
                            disabled={responding}
                          >
                            <CheckIcon className="w-5 h-5" />
                            Accept
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Active Chat Box */}
      {activeChatBooking && (
        <ChatBox
          bookingId={activeChatBooking.id}
          studentName={activeChatBooking.student_name || 'Student'} // Fallback if name missing in some views
          tutorName={activeChatBooking.tutor_name || 'Tutor'}     // Fallback
          onClose={() => setActiveChatBooking(null)}
        />
      )}
    </div>
  );
};

export default BookingFlow;
