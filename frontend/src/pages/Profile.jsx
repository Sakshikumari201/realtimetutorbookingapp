import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [msg, setMsg] = useState({ type: '', text: '' });

  const [form, setForm] = useState({ name: '', email: '' });
  const [pwd, setPwd] = useState({ current_password: '', new_password: '' });
  const [avatarFile, setAvatarFile] = useState(null);

  const avatarUrl = useMemo(() => {
    const pic = user?.profile_pic;
    if (!pic) return '';
    // If backend returns /uploads/..., make it absolute for browser
    if (String(pic).startsWith('/uploads/')) {
      const base = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
      return `${base}${pic}`;
    }
    return pic;
  }, [user?.profile_pic]);

  const load = async () => {
    setMsg({ type: '', text: '' });
    setLoading(true);
    try {
      const res = await api.get('/profile/me');
      const u = res.data.user;
      setForm({
        name: u?.name || '',
        email: u?.email || ''
      });
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.error || 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSaving(true);
    try {
      await api.patch('/profile/me', { name: form.name, email: form.email });
      await refreshMe();
      setMsg({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSaving(true);
    try {
      await api.patch('/profile/password', pwd);
      setPwd({ current_password: '', new_password: '' });
      setMsg({ type: 'success', text: 'Password updated' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || err.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setMsg({ type: 'error', text: 'Please choose an image file first' });
      return;
    }

    setMsg({ type: '', text: '' });
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      await api.post('/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatarFile(null);
      await refreshMe();
      setMsg({ type: 'success', text: 'Avatar updated' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || err.message || 'Failed to upload avatar' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="spinner spinner-lg" />
              <div>
                <div className="text-lg font-semibold">Loading profile</div>
                <div className="text-sm text-text-secondary">Please wait…</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Profile</h2>
          <div className="text-sm text-text-secondary">Update your details and avatar.</div>
        </div>

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

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-bg-elevated border border-gray-700 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm text-text-secondary">No photo</span>
              )}
            </div>
            <div>
              <div className="font-semibold">{user?.name}</div>
              <div className="text-sm text-text-secondary">{user?.email}</div>
              <div className="text-xs text-text-secondary mt-1">Role: {user?.role}</div>
            </div>
          </div>

          <form onSubmit={uploadAvatar} className="mt-6 space-y-3">
            <div>
              <label className="form-label">Upload Avatar</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
            </div>
            <button className="btn btn-primary" disabled={uploading} type="submit">
              {uploading ? (
                <>
                  <span className="spinner" />
                  Uploading…
                </>
              ) : (
                'Upload Avatar'
              )}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold">Account Details</h3>
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <div>
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            </div>
            <button className="btn btn-primary" disabled={saving} type="submit">
              {saving ? (
                <>
                  <span className="spinner" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={pwd.current_password} onChange={(e) => setPwd((p) => ({ ...p, current_password: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={pwd.new_password} onChange={(e) => setPwd((p) => ({ ...p, new_password: e.target.value }))} required />
            </div>
            <button className="btn btn-secondary" disabled={saving} type="submit">
              {saving ? (
                <>
                  <span className="spinner" />
                  Updating…
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
