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
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, bookings, tutors

  // Data States
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [topTutors, setTopTutors] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [adminStats, setAdminStats] = useState(null); // /admin/overview
  const [bookingStats, setBookingStats] = useState(null); // /admin/stats
  const [subjectTrends, setSubjectTrends] = useState([]); // /admin/subjects

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [deletingId, setDeletingId] = useState('');

  // Filters
  const [userFilter, setUserFilter] = useState('All'); // All, student, tutor
  const [bookingFilter, setBookingFilter] = useState('All'); // All, Pending, Approved, Rejected

  const loadAll = async () => {
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const [
        resUsers,
        resBookings,
        resOverview,
        resBookingStats,
        resSubjects,
        resTutors,
        resAlerts
      ] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/bookings'),
        api.get('/admin/overview'),
        api.get('/admin/stats'),
        api.get('/admin/subjects'),
        api.get('/admin/tutors'),
        api.get('/admin/alerts')
      ]);

      setUsers(resUsers.data.users || []);
      setBookings(resBookings.data.bookings || []);
      setAdminStats(resOverview.data);
      setBookingStats(resBookingStats.data);
      setSubjectTrends(resSubjects.data.subject_trends || []);
      setTopTutors(resTutors.data.top_tutors || []);
      setAlerts(resAlerts.data.alerts || []);

    } catch (e) {
      console.error(e);
      setMsg({ type: 'error', text: 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setMsg({ type: 'success', text: 'User deleted successfully' });
      // Refresh user list local state or reload all
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.error || 'Failed to delete user' });
    } finally {
      setDeletingId('');
    }
  };

  /* --- Helpers --- */
  const filteredUsers = users.filter(u => userFilter === 'All' ? true : u.role === userFilter.toLowerCase());
  const filteredBookings = bookings.filter(b => bookingFilter === 'All' ? true : b.status === bookingFilter);

  const statusPie = [
    { name: 'Approved', value: bookingStats?.approved_count ?? 0 },
    { name: 'Pending', value: bookingStats?.pending_count ?? 0 },
    { name: 'Rejected', value: bookingStats?.rejected_count ?? 0 }
  ];

  const pieColors = { Approved: '#22c55e', Pending: '#f59e0b', Rejected: '#ef4444' };

  const subjectBar = subjectTrends.map((s) => ({
    name: String(s.tutor_id).slice(-4), // Short ID
    total: s.total_bookings || 0,
    approved: s.approved || 0
  }));

  const badgeClass = (status) => {
    if (status === 'Approved') return 'badge badge-success';
    if (status === 'Rejected') return 'badge badge-error';
    return 'badge badge-warning';
  };

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-bg-canvas">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-text-secondary mt-1">Platform overview and management console</p>
          </div>
          <button onClick={loadAll} className="btn btn-ghost border border-border flex items-center gap-2">
            🔄 Refresh Data
          </button>
        </div>

        {/* Message Toast */}
        {msg.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${msg.type === 'error' ? 'bg-error/10 border-error/20 text-error' : 'bg-success/10 border-success/20 text-success'
              }`}
          >
            {msg.text}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="border-b border-border flex gap-6 overflow-x-auto">
          {['overview', 'users', 'bookings', 'tutors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 capitalize font-medium transition-colors border-b-2 ${activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && !adminStats ? (
          <div className="py-20 flex justify-center">
            <div className="spinner spinner-lg"></div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="card bg-bg-elevated border-l-4 border-primary">
                    <div className="text-text-secondary text-sm">Total Students</div>
                    <div className="text-2xl font-bold">{adminStats?.total_students || 0}</div>
                  </div>
                  <div className="card bg-bg-elevated border-l-4 border-secondary">
                    <div className="text-text-secondary text-sm">Active Tutors</div>
                    <div className="text-2xl font-bold">{adminStats?.active_tutors || 0}</div>
                  </div>
                  <div className="card bg-bg-elevated border-l-4 border-success">
                    <div className="text-text-secondary text-sm">Total Bookings</div>
                    <div className="text-2xl font-bold">{adminStats?.total_bookings || 0}</div>
                  </div>
                  <div className="card bg-bg-elevated border-l-4 border-warning">
                    <div className="text-text-secondary text-sm">Avg Tutor Rating</div>
                    <div className="text-2xl font-bold">{adminStats?.avg_tutor_rating || 0} ★</div>
                  </div>
                </div>

                {/* Charts & Alerts Row */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Booking Distrib */}
                  <div className="card lg:col-span-1 min-h-[300px] flex flex-col">
                    <h3 className="font-semibold mb-4">Booking Status</h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusPie}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                          >
                            {statusPie.map((entry) => (
                              <Cell key={entry.name} fill={pieColors[entry.name]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-sm mt-2">
                      {statusPie.map(i => (
                        <div key={i.name} className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: pieColors[i.name] }} />
                          <span className="text-text-secondary">{i.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject Trends */}
                  <div className="card lg:col-span-2 min-h-[300px] flex flex-col">
                    <h3 className="font-semibold mb-4">Tutor Activity (Top Subjects)</h3>
                    {subjectBar.length > 0 ? (
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={subjectBar}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                              itemStyle={{ color: '#e5e7eb' }}
                            />
                            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Bookings" />
                            <Bar dataKey="approved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-text-secondary">
                        No trend data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Alerts Section */}
                {alerts.length > 0 && (
                  <div className="card border-warning/30 bg-warning/5">
                    <h3 className="font-semibold text-warning mb-4 flex items-center gap-2">
                      ⚠️ System Alerts
                    </h3>
                    <div className="space-y-3">
                      {alerts.map((alert, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3 bg-bg-elevated rounded-lg border border-border">
                          <span className="text-xl">{alert.type === 'low_rating' ? '📉' : '⏰'}</span>
                          <div>
                            <div className="font-medium text-sm">{alert.message}</div>
                            <div className="text-xs text-text-secondary capitalize">{alert.type.replace('_', ' ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex gap-2 mb-4">
                  {['All', 'Student', 'Tutor', 'Admin'].map(role => (
                    <button
                      key={role}
                      onClick={() => setUserFilter(role)}
                      className={`btn btn-sm ${userFilter === role ? 'btn-primary' : 'btn-ghost border border-border'}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-10 text-text-secondary">No users found for this filter.</div>
                  ) : (
                    filteredUsers.map(user => (
                      <div key={user._id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${user.role === 'admin' ? 'bg-error/20 text-error' :
                              user.role === 'tutor' ? 'bg-primary/20 text-primary' :
                                'bg-secondary/20 text-secondary'
                            }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-text-secondary">{user.email}</div>
                          </div>
                          <span className="badge badge-outline capitalize ml-2">{user.role}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs text-text-secondary mr-2">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => deleteUser(user._id)}
                              disabled={deletingId === user._id}
                              className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                            >
                              {deletingId === user._id ? 'Deleting...' : '🗑️ Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex gap-2 mb-4">
                  {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => setBookingFilter(status)}
                      className={`btn btn-sm ${bookingFilter === status ? 'btn-primary' : 'btn-ghost border border-border'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-10 text-text-secondary">No bookings found.</div>
                  ) : (
                    filteredBookings.map(b => (
                      <div key={b._id} className="card">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-lg">Class Session</span>
                              <span className={badgeClass(b.status)}>{b.status}</span>
                            </div>
                            <div className="text-sm text-text-secondary">
                              Scheduled: {new Date(b.scheduled_at).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex gap-8 text-sm">
                            <div>
                              <div className="text-text-secondary text-xs uppercase tracking-wider">Student</div>
                              <div className="font-medium">{b.student_id?.name || 'Unknown'}</div>
                              <div className="text-text-secondary text-xs">{b.student_id?.email}</div>
                            </div>
                            <div>
                              <div className="text-text-secondary text-xs uppercase tracking-wider">Tutor</div>
                              <div className="font-medium">{b.tutor_id?.name || 'Unknown'}</div>
                              <div className="text-text-secondary text-xs">{b.tutor_id?.subject || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TUTORS TAB (Rankings) */}
            {activeTab === 'tutors' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="card bg-bg-elevated">
                  <h3 className="font-bold text-lg mb-4">Top Performing Tutors</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-text-secondary text-sm">
                          <th className="p-3">Tutor</th>
                          <th className="p-3">Rating</th>
                          <th className="p-3">Subjects</th>
                          <th className="p-3">Total Sessions</th>
                          <th className="p-3">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topTutors.length === 0 ? (
                          <tr><td colSpan="5" className="p-6 text-center text-text-secondary">No tutor data available</td></tr>
                        ) : (
                          topTutors.map(t => (
                            <tr key={t.id} className="border-b border-border hover:bg-bg-canvas transition-colors">
                              <td className="p-3 font-medium flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                  {t.name.charAt(0)}
                                </div>
                                {t.name}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1 text-warning">
                                  <span>★</span> {t.rating.toFixed(1)} <span className="text-text-secondary text-xs">({t.reviews_count})</span>
                                </div>
                              </td>
                              <td className="p-3 text-sm">{t.subjects_taught}</td>
                              <td className="p-3">{t.total_sessions}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-success" style={{ width: `${t.completion_rate}%` }}></div>
                                  </div>
                                  <span className="text-xs">{t.completion_rate}%</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
