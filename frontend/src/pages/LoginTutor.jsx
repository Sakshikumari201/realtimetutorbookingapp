// Tutor Login Page
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid';

export const LoginTutor = () => {
  const { loginTutor, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');
    
    try {
      await loginTutor(email, password);
      window.location.hash = '/tutor';
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-success flex items-center justify-center">
            <AcademicCapIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Tutor Login</h1>
          <p className="text-text-muted text-sm mt-1">Manage your bookings and availability</p>
        </div>

        {(localError || error) && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-error/10 border border-error rounded-lg text-error text-sm">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                className="form-input pl-10"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                className="form-input pl-10"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Tutor'}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm">
          <p className="text-text-muted mb-2">Don't have a tutor account?</p>
          <a href="#/signup/tutor" className="text-primary-light hover:underline">Register as Tutor</a>
        </div>

        <div className="mt-4 text-center">
          <a href="#/login/student" className="text-text-muted text-sm hover:text-text-primary flex items-center justify-center gap-1">
            <UserIcon className="w-4 h-4" />
            Login as Student instead
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginTutor;
