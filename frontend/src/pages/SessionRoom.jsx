import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

const SessionRoom = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const meetingLink = useMemo(() => booking?.meeting_link || '', [booking]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data.booking);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="spinner spinner-lg" />
              <div>
                <div className="text-lg font-semibold">Loading session</div>
                <div className="text-sm text-text-secondary">Please wait…</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="card border-error/40 bg-error/10">
            <div className="text-error font-semibold">Error</div>
            <div className="text-sm text-text-secondary mt-1">{error}</div>
          </div>
          <Link className="btn btn-secondary" to="/dashboard">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <div className="text-lg font-semibold">Session not found</div>
            <div className="text-sm text-text-secondary mt-1">This booking may have been deleted.</div>
          </div>
        </div>
      </div>
    );
  }

  if (booking.status !== 'Approved' || !meetingLink) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="card">
            <div className="text-lg font-semibold">Session not available</div>
            <div className="text-sm text-text-secondary mt-1">This booking must be Approved to join a session.</div>
            <div className="text-sm text-text-secondary mt-2">Current status: <span className="font-semibold text-text-primary">{booking.status}</span></div>
          </div>
          <Link className="btn btn-secondary" to="/dashboard">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Live Session</h2>
            <div className="text-sm text-text-secondary">Booking ID: {booking._id}</div>
          </div>
          <div className="flex gap-2">
            <a className="btn btn-secondary" href={meetingLink} target="_blank" rel="noreferrer">Open in New Tab</a>
            <Link className="btn btn-secondary" to="/dashboard">Back</Link>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <iframe
            title="Jitsi Meet"
            src={meetingLink}
            className="w-full h-[75vh]"
            allow="camera; microphone; fullscreen; display-capture"
          />
        </div>

        <div className="text-xs text-text-secondary">
          If camera/mic permissions don’t work inside the embedded view, use “Open in New Tab”.
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
