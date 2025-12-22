import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-1">Login</h1>
          <p className="text-text-secondary mb-6">Login using your email, password and role.</p>

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
              <label className="form-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="form-input" required />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange} className="form-input" required />
            </div>

            <button disabled={submitting} className="btn btn-primary w-full">
              {submitting ? (
                <>
                  <span className="spinner" />
                  Logging in…
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="mt-4 text-sm text-text-secondary">
            New user? <Link className="underline" to="/">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
