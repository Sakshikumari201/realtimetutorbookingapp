import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const StudentDashboard = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  const [bookingForm, setBookingForm] = useState({ tutor_id: '', scheduled_at: '' });
  const [bookingMsg, setBookingMsg] = useState({ type: '', text: '' });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const getTutorSubject = (t) => t?.subject || (t?.subjects && t.subjects[0]) || '';
  const normalize = (v) => String(v || '').trim().toLowerCase();

  const fetchTutors = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/tutors');
      setTutors(res.data.tutors || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsError('');
    setStatsLoading(true);
    try {
      const res = await api.get('/stats/student');
      setStats(res.data);
    } catch (e) {
      setStatsError(e?.response?.data?.error || 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const [view, setView] = useState('find_tutors'); // 'find_tutors', 'my_bookings', 'learning_library'
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected'
  const [bookings, setBookings] = useState([]);

  const [resources, setResources] = useState([]);
  const [resourceSubject, setResourceSubject] = useState('All');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch (e) {
      console.error('Failed to load bookings', e);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await api.get('/resources');
      setResources(res.data.resources || []);
    } catch (e) {
      console.error('Failed to load resources', e);
    }
  };

  useEffect(() => {
    fetchTutors();
    fetchStats();
    fetchBookings();
    fetchResources();
  }, []);

  const createBooking = async (e) => {
    e.preventDefault();
    setBookingMsg({ type: '', text: '' });
    setBookingSubmitting(true);
    try {
      const res = await api.post('/bookings', bookingForm);
      setBookingMsg({ type: 'success', text: `Booking created: ${res.data.booking?._id}` });
      setBookingForm({ tutor_id: '', scheduled_at: '' });
    } catch (e2) {
      setBookingMsg({ type: 'error', text: e2?.response?.data?.error || 'Failed to create booking' });
    } finally {
      setBookingSubmitting(false);
    }
  };

  const subjects = Array.from(new Set(tutors.map(getTutorSubject).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const filtered = tutors
    .filter((t) => {
      const name = normalize(t?.name);
      const subj = normalize(getTutorSubject(t));
      const q = normalize(query);
      const matchQuery = !q || name.includes(q) || subj.includes(q);
      const matchSubject = subjectFilter === 'all' || normalize(subjectFilter) === subj;
      return matchQuery && matchSubject;
    })
    .sort((a, b) => {
      const an = normalize(a?.name);
      const bn = normalize(b?.name);
      const ae = Number(a?.experience ?? 0);
      const be = Number(b?.experience ?? 0);
      if (sortBy === 'name_desc') return bn.localeCompare(an);
      if (sortBy === 'exp_desc') return be - ae;
      if (sortBy === 'exp_asc') return ae - be;
      return an.localeCompare(bn);
    });

  const selectedTutor = tutors.find((t) => String(t._id || t.id) === String(bookingForm.tutor_id));

  const handleStatClick = (status) => {
    setView('my_bookings');
    setFilterStatus(status);
  };

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'All') return true;
    return b.status === filterStatus;
  });

  const badgeClass = (status) => {
    if (status === 'Approved') return 'badge badge-success';
    if (status === 'Rejected') return 'badge badge-error';
    return 'badge badge-warning';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="spinner spinner-lg" />
              <div>
                <div className="text-lg font-semibold">Loading tutors</div>
                <div className="text-sm text-text-secondary">Please wait…</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Streak Handler */
  const handleResourceClick = async (url) => {
    // 1. Try to open the link immediately to not block user
    window.open(url, '_blank');

    // 2. Update streak in background
    try {
      const res = await api.post('/stats/streak');
      if (res.data.streak > (stats?.streak || 0)) {
        // If streak increased, show a nice toast or just refresh stats
        fetchStats(); // This will update the fire icon number
      }
    } catch (error) {
      console.error("Failed to update streak", error);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Student Dashboard</h2>
            <div className="text-sm text-text-secondary">Search tutors, filter by subject, and manage your bookings.</div>
          </div>
          <div className="flex gap-2">
            <button
              className={`btn ${view === 'find_tutors' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('find_tutors')}
            >
              Book a Tutor
            </button>
            <button
              className={`btn ${view === 'my_bookings' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setView('my_bookings');
                setFilterStatus('All');
              }}
            >
              My Bookings
            </button>
            <button
              className={`btn ${view === 'learning_library' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('learning_library')}
            >
              📚 Library
            </button>
            <button className="btn btn-ghost" onClick={() => { fetchTutors(); fetchStats(); fetchBookings(); fetchResources(); }}>↻</button>
          </div>
        </div>

        {/* Stats Cards - Interactive */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            className="card bg-orange-50/50 border-orange-100"
          >
            <div className="text-sm text-text-secondary">Learning Streak</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">🔥</span>
              <span className="text-2xl font-bold text-orange-600">
                {statsLoading ? '…' : (stats?.streak ?? 0)} days
              </span>
            </div>
          </div>
          <div
            onClick={() => handleStatClick('All')}
            className={`card cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${view === 'my_bookings' && filterStatus === 'All' ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="text-sm text-text-secondary">Total Bookings</div>
            <div className="text-2xl font-bold mt-1 text-primary">
              {statsLoading ? '…' : (stats?.total_bookings ?? 0)}
            </div>
          </div>

          <div
            onClick={() => handleStatClick('Pending')}
            className={`card cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${view === 'my_bookings' && filterStatus === 'Pending' ? 'ring-2 ring-warning' : ''}`}
          >
            <div className="text-sm text-text-secondary">Pending</div>
            <div className="text-2xl font-bold mt-1 text-warning">
              {statsLoading ? '…' : (stats?.pending_count ?? 0)}
            </div>
          </div>
          <div
            onClick={() => handleStatClick('Approved')}
            className={`card cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${view === 'my_bookings' && filterStatus === 'Approved' ? 'ring-2 ring-success' : ''}`}
          >
            <div className="text-sm text-text-secondary">Approved</div>
            <div className="text-2xl font-bold mt-1 text-success">
              {statsLoading ? '…' : (stats?.approved_count ?? 0)}
            </div>
          </div>
        </div>

        {statsError ? (
          <div className="card border-error/40 bg-error/10">
            <div className="text-error font-semibold">Stats Error</div>
            <div className="text-sm text-text-secondary mt-1">{statsError}</div>
          </div>
        ) : null}

        {error ? (
          <div className="card border-error/40 bg-error/10">
            <div className="text-error font-semibold">Error</div>
            <div className="text-sm text-text-secondary mt-1">{error}</div>
          </div>
        ) : null}

        {/* VIEW: FIND TUTORS */}
        {view === 'find_tutors' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="card">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="flex-1">
                    <label className="form-label">Search</label>
                    <input
                      className="form-input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by tutor name or subject…"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:flex md:gap-3 md:items-end">
                    <div>
                      <label className="form-label">Subject</label>
                      <select className="form-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                        <option value="all">All</option>
                        {subjects.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Sort</label>
                      <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                        <option value="exp_desc">Experience (High-Low)</option>
                        <option value="exp_asc">Experience (Low-High)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-text-secondary">
                    Showing <span className="font-semibold text-text-primary">{filtered.length}</span> of{' '}
                    <span className="font-semibold text-text-primary">{tutors.length}</span> tutors
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setQuery('');
                      setSubjectFilter('all');
                      setSortBy('name_asc');
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filtered.length === 0 ? (
                  <div className="card">
                    <div className="text-lg font-semibold">No tutors found</div>
                    <div className="text-sm text-text-secondary mt-1">Try a different search or clear filters.</div>
                  </div>
                ) : (
                  filtered.map((t) => {
                    const tutorId = t._id || t.id;
                    const subject = getTutorSubject(t) || 'N/A';
                    return (
                      <div key={tutorId} className="card hover:-translate-y-0.5 transition-transform">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="font-semibold text-lg flex items-center gap-2">
                                {t.name}
                                {t.badge === 'Gold' && <span className="text-xl" title="Top Rated Tutor">🏆</span>}
                                {t.badge === 'Silver' && <span className="text-xl" title="Experienced Tutor">🥈</span>}
                                {t.badge === 'Bronze' && <span className="text-xl" title="Rising Star">🥉</span>}
                              </div>
                              <span className="badge badge-primary">{subject}</span>
                              {typeof t.experience !== 'undefined' && t.experience !== null ? (
                                <span className="badge bg-bg-elevated text-text-secondary">{t.experience} yrs</span>
                              ) : null}
                            </div>
                            <div className="text-sm text-text-secondary mt-1">Tutor ID: {String(tutorId)}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setBookingForm((p) => ({ ...p, tutor_id: tutorId }));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="card sticky top-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Booking Details</h3>
                  <span className="badge badge-warning">Status: Pending</span>
                </div>
                <div className="text-sm text-text-secondary mt-1">Choose a tutor and a date/time. Tutor will accept or reject.</div>

                <form onSubmit={createBooking} className="mt-4 space-y-4">
                  <div>
                    <label className="form-label">Tutor</label>
                    <select
                      className="form-select"
                      value={bookingForm.tutor_id}
                      onChange={(e) => setBookingForm((p) => ({ ...p, tutor_id: e.target.value }))}
                      required
                    >
                      <option value="">Select a tutor…</option>
                      {tutors.map((t) => {
                        const tutorId = t._id || t.id;
                        const subject = getTutorSubject(t) || 'N/A';
                        return (
                          <option key={tutorId} value={tutorId}>
                            {t.name} - {subject}
                          </option>
                        );
                      })}
                    </select>
                    {selectedTutor ? (
                      <div className="text-xs text-text-secondary mt-2">
                        Selected: <span className="text-text-primary font-semibold">{selectedTutor.name}</span>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="form-label">Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={bookingForm.scheduled_at}
                      onChange={(e) => setBookingForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                      required
                    />
                  </div>

                  <button disabled={bookingSubmitting} className="btn btn-primary w-full">
                    {bookingSubmitting ? (
                      <>
                        <span className="spinner" />
                        Booking…
                      </>
                    ) : (
                      'Book'
                    )}
                  </button>

                  {bookingMsg?.text ? (
                    <div
                      className={`rounded-xl p-3 text-sm border ${bookingMsg.type === 'success'
                        ? 'bg-success/10 border-success/30 text-success'
                        : bookingMsg.type === 'error'
                          ? 'bg-error/10 border-error/30 text-error'
                          : 'bg-bg-elevated border-gray-700 text-text-secondary'
                        }`}
                    >
                      {bookingMsg.text}
                    </div>
                  ) : null}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: MY BOOKINGS */}
        {view === 'my_bookings' && (
          <div className="space-y-4">
            <div className="card bg-bg-elevated border-l-4 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">
                    {filterStatus === 'All' ? 'All Bookings' : `${filterStatus} Bookings`}
                  </h3>
                  <span className="badge badge-primary">{filteredBookings.length}</span>
                </div>
                {/* ALWAYS visible Book a Tutor button for easy access */}
                <button className="btn btn-sm btn-primary" onClick={() => setView('find_tutors')}>
                  + Book a Tutor
                </button>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="card py-12 flex flex-col items-center text-center">
                <div className="text-4xl">📅</div>
                <div className="text-lg font-semibold mt-4">No {filterStatus === 'All' ? '' : filterStatus.toLowerCase()} bookings found</div>
                <div className="text-sm text-text-secondary mt-1">
                  {filterStatus === 'All'
                    ? 'You have not made any bookings yet.'
                    : `You have no ${filterStatus.toLowerCase()} bookings.`}
                </div>
                <button className="btn btn-primary mt-4" onClick={() => setView('find_tutors')}>Book a Tutor</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredBookings.map((b) => (
                  <div key={b._id} className="card transition-all hover:bg-bg-elevated/50">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className={badgeClass(b.status)}>{b.status}</span>
                      <div className="text-xs text-text-secondary"># {b._id.slice(-6)}</div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {b.tutor_id?.name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{b.tutor_id?.name || 'Unknown Tutor'}</div>
                        <div className="text-sm text-text-secondary">{b.tutor_id?.subject || 'General'}</div>
                      </div>
                    </div>

                    <div className="bg-bg border border-border rounded p-3 text-sm flex justify-between items-center">
                      <div className="text-text-secondary">Scheduled for</div>
                      <div className="font-semibold">{new Date(b.scheduled_at).toLocaleString()}</div>
                    </div>

                    {b.status === 'Approved' && b.meeting_link ? (
                      <div className="mt-4">
                        <a
                          className="btn btn-primary w-full"
                          href={b.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          🚀 Join Session
                        </a>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: LEARNING LIBRARY */}
        {view === 'learning_library' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Learning Library</h3>
                  <div className="text-text-secondary text-sm">Access resources shared by expert tutors.</div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-semibold whitespace-nowrap">Filter by Subject:</label>
                  <select
                    className="form-select flex-1 sm:w-48"
                    value={resourceSubject}
                    onChange={(e) => setResourceSubject(e.target.value)}
                  >
                    <option value="All">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.filter(r => resourceSubject === 'All' || r.subject === resourceSubject).length === 0 ? (
                <div className="col-span-full card py-12 flex flex-col items-center text-center">
                  <div className="text-4xl">📚</div>
                  <div className="text-lg font-semibold mt-4">No resources found</div>
                  <div className="text-sm text-text-secondary mt-1">Try selecting a different subject or come back later.</div>
                </div>
              ) : (
                resources.filter(r => resourceSubject === 'All' || r.subject === resourceSubject).map(r => (
                  <div key={r._id} className="card hover:-translate-y-1 transition-transform h-full flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-bg-elevated flex items-center justify-center text-lg">
                          {r.type === 'video' ? '🎥' : r.type === 'document' ? '📄' : '🔗'}
                        </div>
                        <span className="badge badge-secondary">{r.subject}</span>
                      </div>
                      <div className="text-xs text-text-secondary">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>

                    <h4 className="text-lg font-bold mt-3 line-clamp-2">{r.title}</h4>
                    {r.description && <p className="text-text-secondary text-sm mt-2 line-clamp-3 flex-1">{r.description}</p>}

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
                          {r.uploaded_by?.name?.charAt(0) || 'T'}
                        </div>
                        <span>{r.uploaded_by?.name || 'Tutor'}</span>
                      </div>
                      <button
                        onClick={() => handleResourceClick(r.url)}
                        className="btn btn-sm btn-primary"
                      >
                        View {r.type === 'video' ? 'Video' : 'Resource'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;
