import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from './mongoose.js';
import User from '../models/User.js';
import Tutor from '../models/Tutor.js';

dotenv.config();

const initDatabase = async () => {
  try {
    await connectDB();
    console.log('🔧 Initializing database...');

    // Clear existing data
    await User.deleteMany({});
    await Tutor.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Sample users
    const password_hash = await bcrypt.hash('password123', 10);

    const users = [
      { email: 'rahul@test.com', password_hash, name: 'Rahul Sharma', role: 'student' },
      { email: 'priya@test.com', password_hash, name: 'Priya Patel', role: 'student' },
      { email: 'ananya@test.com', password_hash, name: 'Dr. Ananya Krishnamurthy', role: 'tutor' },
      { email: 'vikram@test.com', password_hash, name: 'Prof. Vikram Reddy', role: 'tutor' },
      { email: 'meera@test.com', password_hash, name: 'Meera Iyer', role: 'tutor' },
      { email: 'admin@test.com', password_hash, name: 'Admin', role: 'admin' },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Users inserted');

    // Helpers to find user by email
    const getUser = (email) => createdUsers.find(u => u.email === email);

    // Tutors
    const availability = [];
    const now = new Date();
    // Generate slots for next 7 days
    for (let day = 1; day <= 7; day++) {
      for (const hour of [10, 14, 18]) {
        const slot = new Date(now);
        slot.setDate(now.getDate() + day);
        slot.setHours(hour, 0, 0, 0);
        availability.push({ time_slot: slot, is_booked: false });
      }
    }

    const tutors = [
      {
        user_id: getUser('ananya@test.com')._id,
        name: 'Dr. Ananya Krishnamurthy',
        bio: 'IIT Delhi alumna with 12+ years teaching Mathematics and Calculus',
        profile_pic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya',
        subjects: ['Math', 'Algebra', 'Calculus'],
        languages: ['English', 'Hindi', 'Tamil'],
        hourly_rate: 600,
        rating: 4.9,
        reviews_count: 143,
        availability
      },
      {
        user_id: getUser('vikram@test.com')._id,
        name: 'Prof. Vikram Reddy',
        bio: 'Former IISc professor, passionate about making Physics intuitive',
        profile_pic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
        subjects: ['Physics', 'Math', 'Science'],
        languages: ['English', 'Hindi', 'Telugu'],
        hourly_rate: 550,
        rating: 4.8,
        reviews_count: 98,
        availability
      },
      {
        user_id: getUser('meera@test.com')._id,
        name: 'Meera Iyer',
        bio: 'BITS Pilani graduate, Chemistry specialist with industry experience',
        profile_pic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=meera',
        subjects: ['Chemistry', 'Biology', 'Science'],
        languages: ['English', 'Hindi', 'Malayalam'],
        hourly_rate: 450,
        rating: 4.7,
        reviews_count: 76,
        availability
      }
    ];

    await Tutor.insertMany(tutors);
    console.log('✅ Tutors inserted');

    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
