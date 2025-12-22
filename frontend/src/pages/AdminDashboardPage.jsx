import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import Skeleton from '../components/Skeleton';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  const [bookingStats, setBookingStats] = useState(null);
  const [bookingStatsLoading, setBookingStatsLoading] = useState(true);
  const [bookingStatsError, setBookingStatsError] = useState('');

  const [subjectTrends, setSubjectTrends] = useState([]);
  const [subjectTrendsLoading, setSubjectTrendsLoading] = useState(true);
  const [subjectTrendsError, setSubjectTrendsError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const u = await api.get('/admin/users');
      setUsers(u.data.users || []);

      const b = await api.get('/admin/bookings');
      setBookings(b.data.bookings || []);
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    setOverviewError('');
    setOverviewLoading(true);
    try {
      const res = await api.get('/admin/overview');
      setOverview(res.data);
    } catch (e) {
      setOverviewError(e?.response?.data?.error || 'Failed to load overview');
    } finally {
      setOverviewLoading(false);
    }
  };

  const loadBookingStats = async () => {
    setBookingStatsError('');
    setBookingStatsLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setBookingStats(res.data);
    } catch (e) {
      setBookingStatsError(e?.response?.data?.error || 'Failed to load booking stats');
    } finally {
      setBookingStatsLoading(false);
    }
  };

  const loadSubjectTrends = async () => {
    setSubjectTrendsError('');
    setSubjectTrendsLoading(true);
    try {
      const res = await api.get('/admin/subjects');
      setSubjectTrends(res.data.subject_trends || []);
    } catch (e) {
      setSubjectTrendsError(e?.response?.data?.error || 'Failed to load subject trends');
    } finally {
      setSubjectTrendsLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsError('');
    setStatsLoading(true);
    try {
      const res = await api.get('/stats/admin');
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
    loadOverview();
    loadBookingStats();
    loadSubjectTrends();
  }, []);

  const deleteUser = async (id) => {
    const target = users.find((u) => u._id === id);
    const ok = window.confirm(`Delete user ${target?.name || ''} (${target?.email || ''})?`);
    if (!ok) return;

    setMsg({ type: '', text: '' });
    setDeletingId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setMsg({ type: 'success', text: 'User deleted' });
      await load();
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.error || 'Failed to delete' });
    } finally {
      setDeletingId('');
    }
  };

  const badgeClass = (status) => {
    if (status === 'Approved') return 'badge badge-success';
    if (status === 'Rejected') return 'badge badge-error';
    return 'badge badge-warning';
  };

  const statusPie = [
    { name: 'Approved', value: bookingStats?.approved_count ?? stats?.approved_count ?? 0 },
    { name: 'Pending', value: bookingStats?.pending_count ?? stats?.pending_count ?? 0 },
    { name: 'Rejected', value: bookingStats?.rejected_count ?? stats?.rejected_count ?? 0 }
  ];

  const pieColors = {
    Approved: '#22c55e',
    Pending: '#f59e0b',
    Rejected: '#ef4444'
  };

  const subjectBar = subjectTrends.map((s) => ({
    name: String(s.tutor_id).slice(-6),
    total: s.total_bookings || 0,
    approved: s.approved || 0
  }));

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <div className="text-sm text-text-secondary">Manage users and monitor bookings.</div>
          </div>
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="card">
            <div className="text-sm text-text-secondary">Total Users</div>
            <div className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.total_users ?? 0)}</div>
          </div>
          <div className="card">
            <div className="text-sm text-text-secondary">Total Bookings</div>
            <div className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.total_bookings ?? 0)}</div>
          </div>
          <div className="card">
            <div className="text-sm text-text-secondary">Approved</div>
            <div className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.approved_count ?? 0)}</div>
          </div>
          <div className="card">
            <div className="text-sm text-text-secondary">Pending</div>
            <div className="text-2xl font-bold mt-1">{statsLoading ? '…' : (stats?.pending_count ?? 0)}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-secondary">Booking Status</div>
                <div className="text-lg font-semibold">Distribution</div>
              </div>
              <span className="badge badge-primary">{bookingStats?.period_days ? `${bookingStats.period_days}d` : 'All time'}</span>
            </div>

            {bookingStatsError ? (
              <div className="mt-4 text-sm text-error">{bookingStatsError}</div>
            ) : bookingStatsLoading ? (
              <div className="mt-4">
                <Skeleton className="h-[260px]" />
              </div>
            ) : (
              <div className="mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {statusPie.map((entry) => (
                        <Cell key={entry.name} fill={pieColors[entry.name] || '#60a5fa'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {bookingStats && !bookingStatsLoading ? (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="text-text-secondary">Acceptance Rate: <span className="text-text-primary font-semibold">{bookingStats.acceptance_rate ?? 0}%</span></div>
                <div className="text-text-secondary">Total: <span className="text-text-primary font-semibold">{bookingStats.total_bookings ?? 0}</span></div>
              </div>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-secondary">Platform</div>
                <div className="text-lg font-semibold">Overview</div>
              </div>
            </div>

            {overviewError ? (
              <div className="mt-4 text-sm text-error">{overviewError}</div>
            ) : overviewLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="card bg-bg-elevated">
                  <div className="text-text-secondary">Students</div>
                  <div className="text-xl font-bold">{overview?.total_students ?? 0}</div>
                </div>
                <div className="card bg-bg-elevated">
                  <div className="text-text-secondary">Active Tutors</div>
                  <div className="text-xl font-bold">{overview?.active_tutors ?? 0}</div>
                </div>
                <div className="card bg-bg-elevated">
                  <div className="text-text-secondary">Approved Sessions</div>
                  <div className="text-xl font-bold">{overview?.approved_sessions ?? 0}</div>
                </div>
                <div className="card bg-bg-elevated">
                  <div className="text-text-secondary">Avg Tutor Rating</div>
                  <div className="text-xl font-bold">{overview?.avg_tutor_rating ?? 0}</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-secondary">Activity</div>
              <div className="text-lg font-semibold">Subject Trends (by Tutor ID)</div>
            </div>
          </div>

          {subjectTrendsError ? (
            <div className="mt-4 text-sm text-error">{subjectTrendsError}</div>
          ) : subjectTrendsLoading ? (
            <div className="mt-4">
              <Skeleton className="h-[280px]" />
            </div>
          ) : subjectBar.length === 0 ? (
            <div className="mt-4 text-sm text-text-secondary">No subject trend data available yet.</div>
          ) : (
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBar} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="total" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="approved" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {statsError ? (
          <div className="card border-error/40 bg-error/10">
            <div className="text-error font-semibold">Stats Error</div>
            <div className="text-sm text-text-secondary mt-1">{statsError}</div>
          </div>
        ) : null}

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
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">All Users</h3>
                  <span className="badge badge-primary">{users.length}</span>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="card">
                  <div className="text-lg font-semibold">No users</div>
                  <div className="text-sm text-text-secondary mt-1">Users will appear here after registration.</div>
                </div>
              ) : (
                users.map((u) => (
                  <div key={u._id} className="card flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{u.name}</div>
                        <span className="badge badge-primary">{u.role}</span>
                      </div>
                      <div className="text-sm text-text-secondary mt-1">{u.email}</div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => deleteUser(u._id)}
                      disabled={deletingId === u._id}
                    >
                      {deletingId === u._id ? (
                        <>
                          <span className="spinner" />
                          Deleting…
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">All Bookings</h3>
                  <span className="badge badge-primary">{bookings.length}</span>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="card">
                  <div className="text-lg font-semibold">No bookings</div>
                  <div className="text-sm text-text-secondary mt-1">Bookings will appear here when students create them.</div>
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b._id} className="card">
                    <div className="flex items-center justify-between gap-3">
                      <span className={badgeClass(b.status)}>{b.status}</span>
                      <div className="text-sm text-text-secondary">{new Date(b.scheduled_at).toLocaleString()}</div>
                    </div>
                    <div className="mt-3 grid md:grid-cols-2 gap-2 text-sm">
                      <div className="text-text-secondary">Student: <span className="text-text-primary font-semibold">{b.student_id?.name || 'N/A'}</span></div>
                      <div className="text-text-secondary">Tutor: <span className="text-text-primary font-semibold">{b.tutor_id?.name || 'N/A'}</span></div>
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

export default AdminDashboardPage;
