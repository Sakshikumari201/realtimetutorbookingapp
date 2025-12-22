// Student Signup Page
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid';

const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
const GRADES = ['8th', '9th', '10th', '11th', '12th', 'Undergrad', 'Postgrad'];

export const SignupStudent = () => {
  const { signupStudent, error } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gradeLevel: '12th',
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
    setLoading(true);
    setLocalError('');
    
    try {
      await signupStudent(form.email, form.password, form.name, form.gradeLevel, form.subjects);
      window.location.hash = '/';
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create Student Account</h1>
          <p className="text-text-muted text-sm mt-1">Start learning with expert tutors</p>
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
            <label className="form-label">Grade Level</label>
            <select
              name="gradeLevel"
              className="form-select"
              value={form.gradeLevel}
              onChange={handleChange}
            >
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label flex items-center gap-1">
              <BookOpenIcon className="w-4 h-4" />
              Subjects Interested
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(sub => (
                <button
                  key={sub}
                  type="button"
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all
                    ${form.subjects.includes(sub) 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-bg-elevated border-gray-700 text-text-secondary hover:border-primary'}`}
                  onClick={() => toggleSubject(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm">
          <p className="text-text-muted mb-2">Already have an account?</p>
          <a href="#/login/student" className="text-primary-light hover:underline">Login as Student</a>
        </div>

        <div className="mt-4 text-center">
          <a href="#/signup/tutor" className="text-text-muted text-sm hover:text-text-primary flex items-center justify-center gap-1">
            <AcademicCapIcon className="w-4 h-4" />
            Register as Tutor instead
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignupStudent;
