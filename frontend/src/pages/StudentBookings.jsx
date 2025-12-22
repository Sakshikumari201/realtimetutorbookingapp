import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ChatDrawer from '../components/Chat/ChatDrawer';

const StudentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatBooking, setChatBooking] = useState(null);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  const badgeClass = (status) => {
    if (status === 'Approved') return 'badge badge-success';
    if (status === 'Rejected') return 'badge badge-error';
    return 'badge badge-warning';
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    return b.status === activeTab;
  });

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Bookings</h2>
            <div className="text-sm text-text-secondary">Track your booking requests and their status.</div>
          </div>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>

        {error ? (
          <div className="card border-error/40 bg-error/10">
            <div className="text-error font-semibold">Error</div>
            <div className="text-sm text-text-secondary mt-1">{error}</div>
          </div>
        ) : null}

        <div className="card">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => {
              const active = t === activeTab;
              return (
                <button
                  key={t}
                  className={active ? 'btn btn-primary' : 'btn btn-secondary'}
                  onClick={() => setActiveTab(t)}
                  type="button"
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-text-secondary">
            Showing <span className="font-semibold text-text-primary">{filtered.length}</span> bookings
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="spinner spinner-lg" />
              <div>
                <div className="text-lg font-semibold">Loading bookings</div>
                <div className="text-sm text-text-secondary">Please wait…</div>
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="text-lg font-semibold">No bookings</div>
            <div className="text-sm text-text-secondary mt-1">
              {activeTab === 'All' ? 'You have not created any bookings yet.' : `No ${activeTab} bookings found.`}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <div key={b._id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={badgeClass(b.status)}>{b.status}</span>
                    <div className="text-sm text-text-secondary">Booking ID: {b._id}</div>
                  </div>
                  <div className="text-sm text-text-secondary">
                    Scheduled: <span className="text-text-primary font-semibold">{new Date(b.scheduled_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 grid md:grid-cols-2 gap-2 text-sm">
                  <div className="text-text-secondary">
                    Tutor: <span className="text-text-primary font-semibold">{b.tutor_id?.name || 'N/A'}</span>
                  </div>
                  <div className="text-text-secondary">
                    Student: <span className="text-text-primary font-semibold">{b.student_id?.name || 'You'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="btn btn-secondary w-full"
                    type="button"
                    onClick={() => {
                      setChatBooking(b);
                      setChatOpen(true);
                    }}
                  >
                    Chat
                  </button>
                </div>

                {b.status === 'Approved' && b.meeting_link ? (
                  <div className="mt-4">
                    <a
                      className="btn btn-primary w-full"
                      href={b.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join Session
                    </a>
                    <Link className="btn btn-secondary w-full mt-2" to={`/session/${b._id}`}>
                      Join (In App)
                    </Link>
                    <div className="mt-2 text-xs text-text-secondary">
                      Opens Jitsi Meet in a new tab.
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <ChatDrawer
          open={chatOpen}
          booking={chatBooking}
          onClose={() => {
            setChatOpen(false);
            setChatBooking(null);
          }}
        />
      </div>
    </div>
  );
};

export default StudentBookings;
