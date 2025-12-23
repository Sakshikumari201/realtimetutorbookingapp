import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsBell from './NotificationsBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full border-b border-gray-700/40 bg-bg-card/90 backdrop-blur relative z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link to={user ? '/dashboard' : '/'} className="font-bold text-lg text-text-primary hover:text-text-primary">
          Pre Tech
        </Link>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {user ? (
            <>
              {user.role === 'student' ? (
                <>
                  <Link className="text-sm px-3 py-1.5 rounded-lg hover:bg-bg-elevated" to="/student/dashboard">Dashboard</Link>
                  <Link className="text-sm px-3 py-1.5 rounded-lg hover:bg-bg-elevated" to="/student/bookings">Bookings</Link>
                  <Link className="text-sm px-3 py-1.5 rounded-lg hover:bg-bg-elevated" to="/student/feedback">Feedback</Link>
                </>
              ) : null}

              {user.role === 'tutor' ? (
                <Link className="text-sm px-3 py-1.5 rounded-lg hover:bg-bg-elevated" to="/tutor/dashboard">Dashboard</Link>
              ) : null}

              {user.role === 'admin' ? (
                <Link className="text-sm px-3 py-1.5 rounded-lg hover:bg-bg-elevated" to="/admin/dashboard">Dashboard</Link>
              ) : null}

              <Link className="text-sm px-3 py-1.5 rounded-lg hover:bg-bg-elevated" to="/profile">Profile</Link>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-text-secondary">{user.name}</span>
                <span className="badge badge-primary">{user.role}</span>
              </div>

              <NotificationsBell />
              <button
                onClick={onLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="text-sm px-3 py-1.5 rounded-lg hover:bg-bg-elevated" to="/login">
                Login
              </Link>
              <Link className="text-sm px-3 py-1.5 rounded-lg hover:bg-bg-elevated" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
