// Tutor search hook
import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useTutorSearch = (searchParams) => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalFound, setTotalFound] = useState(0);

  const searchTutors = useCallback(async (params) => {
    if (!params?.subject) {
      setTutors([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/tutors/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error('Failed to fetch tutors');

      const data = await response.json();
      setTutors(data.tutors || []);
      setTotalFound(data.total_found || 0);
    } catch (err) {
      setError(err.message);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchParams?.subject) {
      searchTutors(searchParams);
    }
  }, [searchParams, searchTutors]);

  const refetch = () => {
    if (searchParams?.subject) searchTutors(searchParams);
  };

  return { tutors, loading, error, totalFound, refetch };
};

// Fetch all tutors
export const useAllTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch(`${API_URL}/tutors`);
        if (!response.ok) throw new Error('Failed to fetch tutors');
        const data = await response.json();
        setTutors(data.tutors || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  return { tutors, loading, error };
};

export default useTutorSearch;
