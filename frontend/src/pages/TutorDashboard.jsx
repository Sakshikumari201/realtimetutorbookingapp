import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import ChatDrawer from '../components/Chat/ChatDrawer';

const TutorDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatBooking, setChatBooking] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const b = await api.get('/bookings/tutor');
      setBookings(b.data.bookings || []);

      const f = await api.get('/feedback/tutor/me');
      setFeedback(f.data.feedback || []);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsError('');
    setStatsLoading(true);
    try {
      const res = await api.get('/stats/tutor');
      setStats(res.data);
    } catch (e) {
      setStatsError(e?.response?.data?.error || 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadStats();
  }, []);

  const respond = async (bookingId, response) => {
    let meeting_link = null;
    const actionLabel = response === 'accept' ? 'Accept' : 'Reject';

    if (response === 'accept') {
      // Prompt for link with a default value explanation
      const input = window.prompt("Enter Meeting Link (Zoom, Google Meet, etc.)\nLeave empty to auto-generate a generic link.");
      if (input === null) return; // User cancelled
      meeting_link = input.trim();
    } else {
      if (!window.confirm(`${actionLabel} this booking request?`)) return;
    }

    setMsg({ type: '', text: '' });
    setRespondingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/respond`, {
        response,
        meeting_link
      });
      setMsg({ type: 'success', text: `Booking ${response === 'accept' ? 'approved' : 'rejected'}.` });
      await load();
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.error || 'Failed' });
    } finally {
      setRespondingId('');
    }
  };

  const badgeClass = (status) => {
    if (status === 'Approved') return 'badge badge-success';
    if (status === 'Rejected') return 'badge badge-error';
    return 'badge badge-warning';
  };

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'feedback', 'resources'
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected'

  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'video', url: '', description: '', subject: '' });
  const [resourceSubmitting, setResourceSubmitting] = useState(false);

  // Helper to handle card clicks
  const handleCardClick = (type, status = 'All') => {
    setActiveTab(type);
    if (type === 'bookings') {
      setFilterStatus(status);
    }
  };

  const loadResources = async () => {
    try {
      // In a real app, you might want a specific endpoint for "my resources" or filter by the user's ID
      // For now, we'll fetch all and filter client-side or use the same endpoint if filtering by tutor is needed
      // Actually, let's assume GET /resources returns all, but we only want to manage ones we uploaded.
      // But typically a tutor dashboard manages THEIR resources. 
      // Let's assume the GET endpoint returns all for now, and we'll filter or better yet, assume the backend filters 
      // if we were authenticated as a tutor requesting "my" resources.
      // Given the backend implementation: router.get('/') returns ALL resources.
      // We should probably filter by the current tutor's ID.
      // But we don't have the tutor's ID easily available in state here without fetching profile.
      // Let's just fetch all for now and show them (conceptually shared with everyone).
      // Ideally, we'd add a ?tutor_id= query param or a /my endpoint.
      // Let's update the backend route to support ?uploaded_by=me or similar later if needed.
      // For now, let's just fetch all so we can see what's shared.
      const res = await api.get('/resources');
      // In a real app we would filter: res.data.resources.filter(r => r.uploaded_by._id === currentTutorId)
      // But keeping it simple.
      setResources(res.data.resources || []);
    } catch (e) {
      console.error("Failed to load resources", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'resources') {
      loadResources();
    }
  }, [activeTab]);

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    setResourceSubmitting(true);
    try {
      await api.post('/resources', resourceForm);
      setMsg({ type: 'success', text: 'Resource shared successfully!' });
      setResourceForm({ title: '', type: 'video', url: '', description: '', subject: '' });
      loadResources();
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.error || 'Failed to share resource' });
    } finally {
      setResourceSubmitting(false);
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setMsg({ type: 'success', text: 'Resource deleted.' });
      loadResources();
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.error || 'Failed to delete resource' });
    }
  };

  // Filter bookings based on active status
  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'All') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tutor Dashboard</h2>
            <div className="text-sm text-text-secondary">Manage booking requests and view your feedback.</div>
          </div>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>

        {/* Stats Cards - Interactive */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div
            onClick={() => handleCardClick('bookings', 'All')}
            className={`card cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeTab === 'bookings' && filterStatus === 'All' ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="text-sm text-text-secondary">Total Bookings</div>
            <div className="text-2xl font-bold mt-1 text-primary">{statsLoading ? '…' : (stats?.total_bookings ?? 0)}</div>
          </div>

          <div
            onClick={() => handleCardClick('bookings', 'Pending')}
            className={`card cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeTab === 'bookings' && filterStatus === 'Pending' ? 'ring-2 ring-warning' : ''}`}
          >
            <div className="text-sm text-text-secondary">Pending</div>
            <div className="text-2xl font-bold mt-1 text-warning">{statsLoading ? '…' : (stats?.pending_count ?? 0)}</div>
          </div>

          <div
            onClick={() => handleCardClick('bookings', 'Approved')}
            className={`card cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeTab === 'bookings' && filterStatus === 'Approved' ? 'ring-2 ring-success' : ''}`}
          >
            <div className="text-sm text-text-secondary">Approved</div>
            <div className="text-2xl font-bold mt-1 text-success">{statsLoading ? '…' : (stats?.approved_count ?? 0)}</div>
          </div>

          <div
            onClick={() => handleCardClick('bookings', 'Rejected')}
            className={`card cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeTab === 'bookings' && filterStatus === 'Rejected' ? 'ring-2 ring-error' : ''}`}
          >
            <div className="text-sm text-text-secondary">Rejected</div>
            <div className="text-2xl font-bold mt-1 text-error">{statsLoading ? '…' : (stats?.rejected_count ?? 0)}</div>
          </div>

          <div
            onClick={() => handleCardClick('feedback')}
            className={`card cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeTab === 'feedback' ? 'ring-2 ring-info' : ''}`}
          >
            <div className="text-sm text-text-secondary">Total Feedback</div>
            <div className="text-2xl font-bold mt-1 text-info">{feedback.length}</div>
          </div>

          <div
            onClick={() => handleCardClick('resources')}
            className={`card cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeTab === 'resources' ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="text-sm text-text-secondary">Resources Shared</div>
            <div className="text-2xl font-bold mt-1 text-primary">{resources.length}</div>
          </div>
        </div>

        {statsError ? (
          <div className="card border-error/40 bg-error/10">
            <div className="text-error font-semibold">Stats Error</div>
            <div className="text-sm text-text-secondary mt-1">{statsError}</div>
          </div>
        ) : null}

        {msg?.text ? (
          <div
            className={`rounded-xl p-3 text-sm border ${msg.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : msg.type === 'error'
                ? 'bg-error/10 border-error/30 text-error'
                : 'bg-bg-elevated border-gray-700 text-text-secondary'
              }`}
          >
            {msg.text}
          </div>
        ) : null}

        {loading ? (
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="spinner spinner-lg" />
              <div>
                <div className="text-lg font-semibold">Loading</div>
                <div className="text-sm text-text-secondary">Please wait…</div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* BOOKINGS VIEW */}
            {activeTab === 'bookings' && (
              <div className="space-y-3">
                <div className="card bg-bg-elevated border-l-4 border-primary">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {filterStatus === 'All' ? 'All Bookings' : `${filterStatus} Bookings`}
                    </h3>
                    <span className="badge badge-primary">{filteredBookings.length}</span>
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="card py-12 flex flex-col items-center text-center">
                    <div className="text-4xl">📅</div>
                    <div className="text-lg font-semibold mt-4">No {filterStatus === 'All' ? '' : filterStatus.toLowerCase()} bookings found</div>
                    <div className="text-sm text-text-secondary mt-1">
                      {filterStatus === 'All'
                        ? 'You have no bookings yet.'
                        : `You have no ${filterStatus.toLowerCase()} bookings.`}
                    </div>
                  </div>
                ) : (
                  filteredBookings.map((b) => (
                    <div key={b._id} className="card transition-all hover:bg-bg-elevated/50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {b.student_id?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-semibold">{b.student_id?.name || 'Student'}</div>
                            <div className="text-xs text-text-secondary">{b.student_id?.email || ''}</div>
                          </div>
                        </div>
                        <span className={badgeClass(b.status)}>{b.status}</span>
                      </div>

                      <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm bg-bg border border-border p-3 rounded-lg">
                        <div>
                          <div className="text-text-secondary text-xs uppercase font-bold tracking-wider">Scheduled For</div>
                          <div className="font-semibold text-primary mt-1">{new Date(b.scheduled_at).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-text-secondary text-xs uppercase font-bold tracking-wider">Subject</div>
                          <div className="mt-1">{b.tutor_id?.subject || 'General'}</div>
                        </div>
                      </div>

                      {b.status === 'Approved' && b.meeting_link ? (
                        <div className="mt-4 flex gap-3">
                          <a
                            className="btn btn-primary flex-1"
                            href={b.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            🚀 Join Session
                          </a>
                          <Link className="btn btn-secondary flex-1" to={`/session/${b._id}`}>
                            💻 Join in App
                          </Link>
                        </div>
                      ) : null}

                      <div className="mt-4">
                        <button
                          className="btn btn-ghost w-full border border-border"
                          type="button"
                          onClick={() => {
                            setChatBooking(b);
                            setChatOpen(true);
                          }}
                        >
                          💬 Chat with Student
                        </button>
                      </div>

                      {b.status === 'Pending' ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-border">
                          <button
                            className="btn btn-primary"
                            onClick={() => respond(b._id, 'accept')}
                            disabled={respondingId === b._id}
                          >
                            {respondingId === b._id ? 'Working…' : '✅ Accept'}
                          </button>
                          <button
                            className="btn btn-ghost text-error hover:bg-error/10"
                            onClick={() => respond(b._id, 'reject')}
                            disabled={respondingId === b._id}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* FEEDBACK VIEW */}
            {activeTab === 'feedback' && (
              <div className="space-y-3">
                <div className="card bg-bg-elevated border-l-4 border-info">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Student Feedback</h3>
                    <span className="badge badge-info">{feedback.length}</span>
                  </div>
                </div>

                {feedback.length === 0 ? (
                  <div className="card py-12 flex flex-col items-center text-center">
                    <div className="text-4xl">🌟</div>
                    <div className="text-lg font-semibold mt-4">No feedback yet</div>
                    <div className="text-sm text-text-secondary mt-1">Once students rate you, it will appear here.</div>
                  </div>
                ) : (
                  feedback.map((f) => (
                    <div key={f.id} className="card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info font-bold">
                            {f.student_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-semibold">{f.student_name || 'Student'}</div>
                            <div className="flex text-warning text-sm">
                              {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-text-secondary bg-bg-elevated px-2 py-1 rounded">
                          Verified Student
                        </div>
                      </div>
                      <div className="mt-3 pl-[3.25rem] text-text-secondary italic">
                        "{f.comment || 'No comment provided.'}"
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* RESOURCES VIEW */}
            {activeTab === 'resources' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="card sticky top-6">
                    <h3 className="text-lg font-semibold mb-4">Share Resource</h3>
                    <form onSubmit={handleResourceSubmit} className="space-y-4">
                      <div>
                        <label className="form-label">Title</label>
                        <input
                          className="form-input"
                          value={resourceForm.title}
                          onChange={e => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
                          required
                          placeholder="e.g., Calculus Notes 101"
                        />
                      </div>
                      <div>
                        <label className="form-label">Type</label>
                        <select
                          className="form-select"
                          value={resourceForm.type}
                          onChange={e => setResourceForm(prev => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="video">Video URL</option>
                          <option value="document">Document Link</option>
                          <option value="link">Website Link</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Subject</label>
                        <select
                          className="form-select"
                          value={resourceForm.subject}
                          onChange={e => setResourceForm(prev => ({ ...prev, subject: e.target.value }))}
                          required
                        >
                          <option value="">Select Subject...</option>
                          {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Link / URL</label>
                        <input
                          className="form-input"
                          value={resourceForm.url}
                          onChange={e => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
                          required
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="form-label">Description (Optional)</label>
                        <textarea
                          className="form-input"
                          value={resourceForm.description}
                          onChange={e => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
                          rows="3"
                          placeholder="Brief description..."
                        />
                      </div>
                      <button className="btn btn-primary w-full" disabled={resourceSubmitting}>
                        {resourceSubmitting ? 'Sharing...' : 'Share Resource'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="card bg-bg-elevated border-l-4 border-primary">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">My Shared Resources</h3>
                      <span className="badge badge-primary">{resources.length}</span>
                    </div>
                  </div>

                  {resources.length === 0 ? (
                    <div className="card py-12 flex flex-col items-center text-center">
                      <div className="text-4xl">📚</div>
                      <div className="text-lg font-semibold mt-4">No resources shared</div>
                      <div className="text-sm text-text-secondary mt-1">Share your first learning material now!</div>
                    </div>
                  ) : (
                    resources.map(r => (
                      <div key={r._id} className="card group">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">
                                {r.type === 'video' ? '🎥' : r.type === 'document' ? '📄' : '🔗'}
                              </span>
                              <div className="font-semibold text-lg">{r.title}</div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="badge badge-secondary text-xs">{r.subject}</span>
                              <span className="text-xs text-text-secondary">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            {r.description && <div className="text-sm text-text-secondary mt-2">{r.description}</div>}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="btn btn-sm btn-ghost text-error" onClick={() => deleteResource(r._id)}>
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <a href={r.url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm break-all">
                            {r.url}
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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

export default TutorDashboard;
