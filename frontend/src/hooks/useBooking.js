// Booking hook with polling
import { useState, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useBooking = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  const createBooking = async (studentId, tutorId, timeSlot, durationMinutes = 60, subject, notes = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          tutor_id: tutorId,
          time_slot: timeSlot,
          duration_minutes: durationMinutes,
          subject,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const data = await response.json();
      setBooking(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pollBookingStatus = useCallback((bookingId, interval = 3000, onStatusChange) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    const poll = async () => {
      try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`);
        if (!response.ok) throw new Error('Failed to fetch booking');
        
        const data = await response.json();
        setBooking(data);
        if (onStatusChange) onStatusChange(data);

        if (data.status !== 'requested') {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, interval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const resetBooking = useCallback(() => {
    setBooking(null);
    setError(null);
    stopPolling();
  }, [stopPolling]);

  return { booking, loading, error, createBooking, pollBookingStatus, stopPolling, resetBooking };
};

// Tutor response hook
export const useBookingResponse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const respondToBooking = async (bookingId, tutorId, response) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutor_id: tutorId, response }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to respond to booking');
      }

      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { respondToBooking, loading, error };
};

export default useBooking;
