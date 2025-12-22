-- Tutor Booking System Database Schema

-- Users table (base for students, tutors, admins)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'tutor', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table (extends users with student-specific fields)
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  grade_level VARCHAR(50),
  subjects_interested TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutors table (extends users with tutor-specific fields)
CREATE TABLE IF NOT EXISTS tutors (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  bio TEXT,
  profile_pic VARCHAR(255),
  subjects TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(8, 2) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutor availability slots
CREATE TABLE IF NOT EXISTS tutor_availability (
  id SERIAL PRIMARY KEY,
  tutor_id INT NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  time_slot TIMESTAMP NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tutor_id, time_slot)
);

-- Bookings with state machine
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id),
  tutor_id INT NOT NULL REFERENCES tutors(id),
  time_slot TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 60,
  subject VARCHAR(100),
  status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'rejected', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tutor_id, time_slot)
);

-- Feedback for completed sessions
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id),
  tutor_id INT NOT NULL REFERENCES tutors(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning outcomes tracking
CREATE TABLE IF NOT EXISTS learning_outcomes (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id),
  subject VARCHAR(100),
  indicator VARCHAR(100),
  before_level INT CHECK (before_level >= 1 AND before_level <= 10),
  after_level INT CHECK (after_level >= 1 AND after_level <= 10),
  delta_improvement DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(booking_id, indicator)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tutors_subjects ON tutors USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_tutors_active ON tutors(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_tutor_avail_slot ON tutor_availability(tutor_id, time_slot, is_booked);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor ON bookings(tutor_id, status);
CREATE INDEX IF NOT EXISTS idx_outcomes_student ON learning_outcomes(student_id, subject);
CREATE INDEX IF NOT EXISTS idx_feedback_tutor ON feedback(tutor_id);
