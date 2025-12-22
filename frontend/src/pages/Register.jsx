import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    role: 'student',
    name: '',
    email: '',
    password: '',
    subject: '',
    experience: '',
    adminSecretKey: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-1">Register</h1>
          <p className="text-text-secondary mb-6">Create your account. After registration, you will be redirected to Login.</p>

          {error ? (
            <div className="mb-4 rounded-xl p-3 text-sm border bg-error/10 border-error/30 text-error">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="form-label">Role</label>
              <select name="role" value={form.role} onChange={onChange} className="form-select">
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="form-label">Name</label>
              <input name="name" value={form.name} onChange={onChange} className="form-input" required />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="form-input" required />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange} className="form-input" required />
            </div>

            {form.role === 'tutor' ? (
              <>
                <div>
                  <label className="form-label">Subject</label>
                  <input name="subject" value={form.subject} onChange={onChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Experience (years)</label>
                  <input type="number" name="experience" value={form.experience} onChange={onChange} className="form-input" required />
                </div>
              </>
            ) : null}

            {form.role === 'admin' ? (
              <div>
                <label className="form-label">Admin Secret Key</label>
                <input type="password" name="adminSecretKey" value={form.adminSecretKey} onChange={onChange} className="form-input" required />
              </div>
            ) : null}

            <button disabled={submitting} className="btn btn-primary w-full">
              {submitting ? (
                <>
                  <span className="spinner" />
                  Registering…
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <p className="mt-4 text-sm text-text-secondary">
            Already have an account? <Link className="underline" to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
