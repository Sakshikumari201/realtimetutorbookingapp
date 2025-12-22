import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

import User from '../models/User.js';
import Tutor from '../models/Tutor.js';

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const data = user.toObject();
    data.id = data._id;

    if (user.role === 'tutor') {
      const tutor = await Tutor.findOne({ user_id: user._id });
      data.tutor_id = tutor?._id;
    }

    res.json({ user: data });
  } catch (e) {
    console.error('getMyProfile error:', e);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email && String(email).toLowerCase() !== String(user.email).toLowerCase()) {
      const existing = await User.findOne({ email: String(email).toLowerCase() });
      if (existing) return res.status(409).json({ error: 'Email already registered' });
      user.email = String(email).toLowerCase();
    }

    if (name) user.name = String(name).trim();

    await user.save();

    if (user.role === 'tutor') {
      await Tutor.updateOne({ user_id: user._id }, { $set: { name: user.name } });
    }

    const safeUser = await User.findById(user._id).select('-password_hash');
    const data = safeUser.toObject();
    data.id = data._id;

    if (safeUser.role === 'tutor') {
      const tutor = await Tutor.findOne({ user_id: safeUser._id });
      data.tutor_id = tutor?._id;
    }

    res.json({ message: 'Profile updated', user: data });
  } catch (e) {
    console.error('updateMyProfile error:', e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(String(current_password), user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password_hash = await bcrypt.hash(String(new_password), 10);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (e) {
    console.error('changeMyPassword error:', e);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const uploadMyAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'avatar file is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete old file if it was a local upload
    if (user.profile_pic && String(user.profile_pic).startsWith('/uploads/')) {
      const oldPath = path.join(process.cwd(), String(user.profile_pic).replace(/^\//, ''));
      try {
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch {
        // ignore
      }
    }

    user.profile_pic = `/uploads/${req.file.filename}`;
    await user.save();

    if (user.role === 'tutor') {
      await Tutor.updateOne({ user_id: user._id }, { $set: { profile_pic: user.profile_pic } });
    }

    const safeUser = await User.findById(user._id).select('-password_hash');
    const data = safeUser.toObject();
    data.id = data._id;

    if (safeUser.role === 'tutor') {
      const tutor = await Tutor.findOne({ user_id: safeUser._id });
      data.tutor_id = tutor?._id;
    }

    res.json({ message: 'Avatar updated', user: data, profile_pic: user.profile_pic });
  } catch (e) {
    console.error('uploadMyAvatar error:', e);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};
