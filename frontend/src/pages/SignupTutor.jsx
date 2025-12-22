// Tutor Signup Page
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid';

const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History'];

export const SignupTutor = () => {
  const { signupTutor, error } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    hourlyRate: 500,
    subjects: []
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleSubject = (subject) => {
    const current = form.subjects;
    if (current.includes(subject)) {
      setForm({ ...form, subjects: current.filter(s => s !== subject) });
    } else {
      setForm({ ...form, subjects: [...current, subject] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.subjects.length === 0) {
      setLocalError('Please select at least one subject');
      return;
    }
    
    setLoading(true);
    setLocalError('');
    
    try {
      await signupTutor(form.email, form.password, form.name, form.subjects, form.hourlyRate, form.bio);
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
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-success flex items-center justify-center">
            <AcademicCapIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Become a Tutor</h1>
          <p className="text-text-muted text-sm mt-1">Share your knowledge and earn</p>
        </div>

        {(localError || error) && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-error/10 border border-error rounded-lg text-error text-sm">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                name="name"
                className="form-input pl-10"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                name="email"
                className="form-input pl-10"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
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
                name="password"
                className="form-input pl-10"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label flex items-center gap-1">
              <AcademicCapIcon className="w-4 h-4" />
              Subjects You Teach
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(sub => (
                <button
                  key={sub}
                  type="button"
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all
                    ${form.subjects.includes(sub) 
                      ? 'bg-accent text-white border-accent' 
                      : 'bg-bg-elevated border-gray-700 text-text-secondary hover:border-accent'}`}
                  onClick={() => toggleSubject(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label flex items-center gap-1">
              <CurrencyRupeeIcon className="w-4 h-4" />
              Hourly Rate (₹)
            </label>
            <input
              type="number"
              name="hourlyRate"
              className="form-input"
              min="100"
              max="5000"
              step="50"
              value={form.hourlyRate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-1">
              <DocumentTextIcon className="w-4 h-4" />
              Short Bio
            </label>
            <textarea
              name="bio"
              className="form-input resize-none"
              rows="2"
              placeholder="Your experience and teaching style..."
              value={form.bio}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register as Tutor'}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm">
          <p className="text-text-muted mb-2">Already have a tutor account?</p>
          <a href="#/login/tutor" className="text-primary-light hover:underline">Login as Tutor</a>
        </div>

        <div className="mt-4 text-center">
          <a href="#/signup/student" className="text-text-muted text-sm hover:text-text-primary flex items-center justify-center gap-1">
            <UserIcon className="w-4 h-4" />
            Register as Student instead
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignupTutor;
