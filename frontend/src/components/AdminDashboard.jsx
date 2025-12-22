// Admin dashboard with Heroicons
import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const AdminDashboard = () => {
  const [bookingStats, setBookingStats] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tutorRes, subjectRes, alertsRes] = await Promise.all([
          fetch(`${API_URL}/admin/stats`),
          fetch(`${API_URL}/admin/tutors`),
          fetch(`${API_URL}/admin/subjects`),
          fetch(`${API_URL}/admin/alerts`),
        ]);

        if (!statsRes.ok || !tutorRes.ok || !subjectRes.ok || !alertsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        setBookingStats(await statsRes.json());
        setTutors((await tutorRes.json()).top_tutors || []);
        setSubjects((await subjectRes.json()).subject_trends || []);
        setAlerts((await alertsRes.json()).alerts || []);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <ArrowPathIcon className="w-12 h-12 text-primary animate-spin" />
        <p className="text-text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <ExclamationTriangleIcon className="w-12 h-12 text-error" />
        <p className="text-error">Error: {error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8 text-primary-light" />
          Admin Dashboard
        </h1>
        <p className="text-text-muted">Platform analytics and monitoring</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card flex items-center gap-4 p-5 hover:border-primary hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-primary-light" />
          </div>
          <div>
            <span className="text-2xl font-bold block">{bookingStats?.total_bookings || 0}</span>
            <span className="text-sm text-text-muted">Total Bookings</span>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5 hover:border-primary hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6 text-success" />
          </div>
          <div>
            <span className="text-2xl font-bold text-success block">{bookingStats?.acceptance_rate || 0}%</span>
            <span className="text-sm text-text-muted">Acceptance Rate</span>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5 hover:border-primary hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-warning" />
          </div>
          <div>
            <span className="text-2xl font-bold block">{Number(bookingStats?.avg_response_time_mins)?.toFixed(1) || '0'} min</span>
            <span className="text-sm text-text-muted">Avg Response Time</span>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5 hover:border-primary hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <span className="text-2xl font-bold text-primary-light block">{bookingStats?.completed_count || 0}</span>
            <span className="text-sm text-text-muted">Completed Sessions</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
            Alerts ({alerts.length})
          </h2>
          <div className="flex flex-col gap-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`card p-4 border-l-4 
                ${alert.severity === 'warning' ? 'border-l-warning bg-warning/5' : 'border-l-error bg-error/5'}`}>
                <span className="text-xs font-semibold uppercase text-warning block mb-1">
                  {alert.type.replace(/_/g, ' ')}
                </span>
                <p className="text-text-secondary">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tutor Leaderboard */}
        <div className="card">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 text-warning" />
            Top Tutors
          </h2>
          <p className="text-text-muted text-sm mb-4">By outcome improvement</p>
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold uppercase text-text-muted">
                <th className="text-left p-3 border-b border-gray-700">Tutor</th>
                <th className="text-left p-3 border-b border-gray-700">Rating</th>
                <th className="text-left p-3 border-b border-gray-700">Sessions</th>
                <th className="text-left p-3 border-b border-gray-700">Improvement</th>
              </tr>
            </thead>
            <tbody>
              {tutors.length === 0 ? (
                <tr><td colSpan="4" className="text-center text-text-muted p-4">No data yet</td></tr>
              ) : (
                tutors.map((tutor, idx) => (
                  <tr key={tutor.id} className="hover:bg-bg-elevated">
                    <td className="p-3 border-b border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted w-6">#{idx + 1}</span>
                        <img 
                          src={tutor.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.name}`}
                          alt={tutor.name}
                          className="w-7 h-7 rounded-full"
                        />
                        <span>{tutor.name}</span>
                      </div>
                    </td>
                    <td className="p-3 border-b border-gray-700/50">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-warning" />
                        {Number(tutor.rating)?.toFixed(1) || '-'}
                      </div>
                    </td>
                    <td className="p-3 border-b border-gray-700/50">{tutor.total_sessions || 0}</td>
                    <td className="p-3 border-b border-gray-700/50 text-success">
                      {tutor.avg_outcome_delta ? `+${(tutor.avg_outcome_delta * 100).toFixed(0)}%` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Subject Trends */}
        <div className="card">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <BookOpenIcon className="w-6 h-6 text-primary-light" />
            Subject Trends
          </h2>
          <p className="text-text-muted text-sm mb-4">Last 60 days</p>
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold uppercase text-text-muted">
                <th className="text-left p-3 border-b border-gray-700">Subject</th>
                <th className="text-left p-3 border-b border-gray-700">Bookings</th>
                <th className="text-left p-3 border-b border-gray-700">Improvement</th>
                <th className="text-left p-3 border-b border-gray-700">Rating</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr><td colSpan="4" className="text-center text-text-muted p-4">No data yet</td></tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject.subject} className="hover:bg-bg-elevated">
                    <td className="p-3 border-b border-gray-700/50 font-semibold">{subject.subject}</td>
                    <td className="p-3 border-b border-gray-700/50">{subject.total_bookings}</td>
                    <td className="p-3 border-b border-gray-700/50 text-success">
                      {subject.avg_improvement ? `+${(subject.avg_improvement * 100).toFixed(0)}%` : '-'}
                    </td>
                    <td className="p-3 border-b border-gray-700/50">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-warning" />
                        {Number(subject.avg_rating)?.toFixed(1) || '-'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
