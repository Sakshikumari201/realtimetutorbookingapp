// Feedback and progress page with Heroicons
import React, { useState, useEffect } from 'react';
import FeedbackForm from '../components/FeedbackForm';
import OutcomeTracker from '../components/OutcomeTracker';
import { 
  PencilSquareIcon, 
  ChartBarIcon, 
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const FeedbackPage = () => {
  const [view, setView] = useState('submit');
  const [completedBookings, setCompletedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = 1;

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/bookings/student/${studentId}?status=completed`);
      const data = await res.json();
      setCompletedBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSuccess = (result) => {
    setFeedbackSuccess(result);
    setSelectedBooking(null);
    fetchCompletedBookings();
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <PencilSquareIcon className="w-8 h-8 text-primary-light" />
          Feedback & Progress
        </h1>
        <p className="text-text-muted">Share your experience and track your learning journey</p>
      </header>

      {/* View Toggle */}
      <div className="flex p-1 bg-bg-card border border-gray-700 rounded-xl mb-8">
        <button
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2
            ${view === 'submit' ? 'bg-gradient-to-r from-primary to-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
          onClick={() => setView('submit')}
        >
          <PencilSquareIcon className="w-5 h-5" />
          Submit Feedback
        </button>
        <button
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2
            ${view === 'progress' ? 'bg-gradient-to-r from-primary to-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
          onClick={() => setView('progress')}
        >
          <ChartBarIcon className="w-5 h-5" />
          My Progress
        </button>
      </div>

      {/* Success Message */}
      {feedbackSuccess && (
        <div className="card flex items-center justify-between p-4 mb-6 bg-success/10 border-success">
          <div className="flex items-center gap-4">
            <CheckCircleIcon className="w-8 h-8 text-success" />
            <div>
              <strong>Feedback Submitted!</strong>
              <p className="text-text-muted text-sm">
                Recommendation: <span className="badge badge-primary ml-1">{feedbackSuccess.recommendation}</span>
              </p>
            </div>
          </div>
          <button className="p-1 text-text-muted hover:text-text-primary" onClick={() => setFeedbackSuccess(null)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      {view === 'submit' && (
        <div>
          {selectedBooking ? (
            <div>
              <button className="btn btn-ghost mb-4" onClick={() => setSelectedBooking(null)}>
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Sessions
              </button>
              <FeedbackForm
                booking={{ ...selectedBooking, student_id: studentId }}
                onSuccess={handleFeedbackSuccess}
                onCancel={() => setSelectedBooking(null)}
              />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">Completed Sessions</h2>
              <p className="text-text-muted mb-6">Select a session to provide feedback</p>

              {loading ? (
                <div className="flex flex-col items-center py-12 gap-4">
                  <ArrowPathIcon className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-text-muted">Loading sessions...</p>
                </div>
              ) : completedBookings.length === 0 ? (
                <div className="card text-center py-12">
                  <PencilSquareIcon className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                  <h3 className="text-xl font-bold mb-2">No Completed Sessions</h3>
                  <p className="text-text-muted">Complete a tutoring session to provide feedback</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {completedBookings.map(booking => (
                    <div
                      key={booking.id}
                      className="card flex items-center justify-between p-4 cursor-pointer hover:border-primary hover:translate-x-1 transition-all"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.tutor_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.tutor_name}`}
                          alt={booking.tutor_name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <strong>{booking.tutor_name}</strong>
                          <span className="text-text-muted"> · {booking.subject}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-text-muted">
                          {new Date(booking.time_slot).toLocaleDateString()}
                        </span>
                        <span className="badge badge-primary">Give Feedback</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {view === 'progress' && <OutcomeTracker studentId={studentId} />}
    </div>
  );
};

export default FeedbackPage;
