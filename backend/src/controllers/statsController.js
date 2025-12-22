import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';
import User from '../models/User.js';
import Student from '../models/Student.js';

export const getStudentStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can access student stats' });
    }

    const studentId = req.user.id;

    // Fetch student profile for streak data
    const student = await Student.findOne({ user_id: studentId });

    const [totalBookings, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Booking.countDocuments({ student_id: studentId }),
      Booking.countDocuments({ student_id: studentId, status: 'Pending' }),
      Booking.countDocuments({ student_id: studentId, status: 'Approved' }),
      Booking.countDocuments({ student_id: studentId, status: 'Rejected' })
    ]);

    res.json({
      total_bookings: totalBookings,
      pending_count: pendingCount,
      approved_count: approvedCount,
      rejected_count: rejectedCount,
      streak: student?.streak || 0
    });
  } catch (error) {
    console.error('getStudentStats error:', error);
    res.status(500).json({ error: 'Failed to fetch student stats' });
  }
};

export const getTutorStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can access tutor stats' });
    }

    const tutor = await Tutor.findOne({ user_id: req.user.id });
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const [totalBookings, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Booking.countDocuments({ tutor_id: tutor._id }),
      Booking.countDocuments({ tutor_id: tutor._id, status: 'Pending' }),
      Booking.countDocuments({ tutor_id: tutor._id, status: 'Approved' }),
      Booking.countDocuments({ tutor_id: tutor._id, status: 'Rejected' })
    ]);

    res.json({
      total_bookings: totalBookings,
      pending_count: pendingCount,
      approved_count: approvedCount,
      rejected_count: rejectedCount
    });
  } catch (error) {
    console.error('getTutorStats error:', error);
    res.status(500).json({ error: 'Failed to fetch tutor stats' });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access admin stats' });
    }

    const [totalUsers, totalStudents, totalTutorsUsers, totalTutorsProfiles, totalBookings, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'tutor' }),
      Tutor.countDocuments({}),
      Booking.countDocuments({}),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments({ status: 'Approved' }),
      Booking.countDocuments({ status: 'Rejected' })
    ]);

    res.json({
      total_users: totalUsers,
      total_students: totalStudents,
      total_tutors_users: totalTutorsUsers,
      total_tutors_profiles: totalTutorsProfiles,
      total_bookings: totalBookings,
      pending_count: pendingCount,
      approved_count: approvedCount,
      rejected_count: rejectedCount
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

export const updateStreak = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can update streak' });
    }

    const studentId = req.user.id;
    const student = await Student.findOne({ user_id: studentId });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const now = new Date();
    const lastAction = new Date(student.lastActionDate);

    // Reset time components to compare just the dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(lastAction.getFullYear(), lastAction.getMonth(), lastAction.getDate());

    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let message = 'Streak maintained';

    if (diffDays === 1) {
      // Consecutive day
      student.streak += 1;
      student.lastActionDate = now;
      message = 'Streak increased! 🔥';
    } else if (diffDays > 1) {
      // Missed a day (or more)
      student.streak = 1; // Reset to 1 (since they are active today)
      student.lastActionDate = now;
      message = 'Streak reset, but you are back! 🔥';
    } else {
      // Same day, update timestamp but don't increase streak
      student.lastActionDate = now;
    }

    await student.save();

    res.json({
      streak: student.streak,
      message
    });

  } catch (error) {
    console.error('updateStreak error:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
};
