import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationsProvider } from './context/NotificationsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ToastStack from './components/ToastStack';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';

import StudentDashboard from './pages/StudentDashboard';
import StudentBookings from './pages/StudentBookings';
import StudentFeedback from './pages/StudentFeedback';
import TutorDashboard from './pages/TutorDashboard';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SessionRoom from './pages/SessionRoom';
import Profile from './pages/Profile';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ToastStack />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'tutor') return <Navigate to="/tutor/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationsProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute allowedRoles={['student', 'tutor', 'admin']} />}>
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route path="/session/:bookingId" element={<SessionRoom />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/bookings" element={<StudentBookings />} />
                <Route path="/student/feedback" element={<StudentFeedback />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['tutor']} />}>
                <Route path="/tutor/dashboard" element={<TutorDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </NotificationsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
