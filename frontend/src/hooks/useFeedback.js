// Feedback hook
import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitFeedback = async (bookingId, studentId, rating, comment, outcomes = []) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          student_id: studentId,
          rating,
          comment,
          outcomes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchOutcomes = useCallback(async (studentId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/feedback/outcomes/${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch outcomes');
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitFeedback, fetchOutcomes, loading, error };
};

// Tutor feedback history hook
export const useTutorFeedback = (tutorId) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedback = useCallback(async () => {
    if (!tutorId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/feedback/tutor/${tutorId}`);
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tutorId]);

  return { feedback, loading, error, refetch: fetchFeedback };
};

export default useFeedback;
