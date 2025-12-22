import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const StudentFeedback = () => {
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ booking_id: '', rating: 5, comment: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadApprovedBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my', { params: { status: 'Approved' } });
      setBookings(res.data.bookings || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovedBookings();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSubmitting(true);
    try {
      await api.post('/feedback', {
        booking_id: form.booking_id,
        rating: Number(form.rating),
        comment: form.comment
      });
      setMsg({ type: 'success', text: 'Feedback submitted' });
      setForm({ booking_id: '', rating: 5, comment: '' });
    } catch (e2) {
      setMsg({ type: 'error', text: e2?.response?.data?.error || 'Failed to submit feedback' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Submit Feedback</h2>
            <div className="text-sm text-text-secondary">Only Approved bookings can receive feedback.</div>
          </div>
          <button className="btn btn-secondary" onClick={loadApprovedBookings} type="button">Refresh</button>
        </div>

        {loading ? (
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="spinner spinner-lg" />
              <div>
                <div className="text-lg font-semibold">Loading approved bookings</div>
                <div className="text-sm text-text-secondary">Please wait…</div>
              </div>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card">
            <div className="text-lg font-semibold">No approved bookings</div>
            <div className="text-sm text-text-secondary mt-1">Once a tutor approves a booking, it will appear here for feedback.</div>
          </div>
        ) : (
          <div className="card">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="form-label">Booking</label>
                <select
                  className="form-select"
                  value={form.booking_id}
                  onChange={(e) => setForm((p) => ({ ...p, booking_id: e.target.value }))}
                  required
                >
                  <option value="">Select booking…</option>
                  {bookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {new Date(b.scheduled_at).toLocaleString()} - {b.tutor_id?.name || 'Tutor'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="form-input"
                  value={form.rating}
                  onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="form-label">Comment</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={form.comment}
                  onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                  placeholder="Write a short review (optional)…"
                />
              </div>

              <button disabled={submitting} className="btn btn-primary w-full">
                {submitting ? (
                  <>
                    <span className="spinner" />
                    Submitting…
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>

              {msg?.text ? (
                <div
                  className={`rounded-xl p-3 text-sm border ${
                    msg.type === 'success'
                      ? 'bg-success/10 border-success/30 text-success'
                      : msg.type === 'error'
                        ? 'bg-error/10 border-error/30 text-error'
                        : 'bg-bg-elevated border-gray-700 text-text-secondary'
                  }`}
                >
                  {msg.text}
                </div>
              ) : null}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeedback;
