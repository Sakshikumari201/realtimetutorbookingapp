// Feedback and learning outcome tracking
import Feedback from '../models/Feedback.js';
import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';
import LearningOutcome from '../models/LearningOutcome.js';
import User from '../models/User.js';

// Submit feedback for completed session
export const submitFeedback = async (req, res) => {
  try {
    const { booking_id, rating, comment, outcomes } = req.body;

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit feedback' });
    }

    if (!booking_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields: booking_id, rating' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findOne({ _id: booking_id, student_id: req.user.id });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'Approved') {
      return res.status(400).json({ error: 'Only approved bookings can receive feedback' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ booking_id });
    if (existingFeedback) {
      return res.status(409).json({ error: 'Feedback already submitted for this booking' });
    }

    // Validate outcome levels
    if (outcomes && Array.isArray(outcomes)) {
      for (const outcome of outcomes) {
        if (outcome.before_level < 1 || outcome.before_level > 10 ||
          outcome.after_level < 1 || outcome.after_level > 10) {
          return res.status(400).json({ error: 'Levels must be between 1 and 10' });
        }
      }
    }

    // Insert feedback
    const feedback = await Feedback.create({
      booking_id,
      student_id: req.user.id,
      tutor_id: booking.tutor_id,
      rating,
      comment
    });

    // Insert/Update learning outcomes
    if (outcomes && outcomes.length > 0) {
      for (const outcome of outcomes) {
        const deltaImprovement = (outcome.after_level - outcome.before_level) / 10;

        await LearningOutcome.findOneAndUpdate(
          { booking_id, indicator: outcome.indicator },
          {
            student_id: req.user.id,
            subject: 'General',
            before_level: outcome.before_level,
            after_level: outcome.after_level,
            delta_improvement: deltaImprovement
          },
          { upsert: true }
        );
      }
    }

    // Update tutor rating
    // Recalculate average rating
    const feedbacks = await Feedback.find({ tutor_id: booking.tutor_id });
    const avgRating = feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length;

    await Tutor.findByIdAndUpdate(booking.tutor_id, {
      rating: Math.round(avgRating * 100) / 100,
      $inc: { reviews_count: 1 }
    });

    const recommendation = generateOutcomeRecommendation(outcomes);

    res.status(201).json({
      feedback_id: feedback._id,
      rating,
      recommendation,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('submitFeedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Generate recommendation: continue | level_up | switch_tutor
const generateOutcomeRecommendation = (outcomes) => {
  if (!outcomes || outcomes.length === 0) return 'continue';

  const avgDelta = outcomes.reduce((sum, o) => sum + (o.after_level - o.before_level), 0) / outcomes.length;
  const avgAfter = outcomes.reduce((sum, o) => sum + o.after_level, 0) / outcomes.length;

  if (avgDelta >= 3 && avgAfter >= 7) return 'level_up';
  if (avgDelta <= 0.5) return 'switch_tutor';
  return 'continue';
};

// Get student's learning outcomes
export const getStudentOutcomes = async (req, res) => {
  try {
    const { student_id } = req.params;

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view outcomes' });
    }

    if (String(req.user.id) !== String(student_id)) {
      return res.status(403).json({ error: 'You can only view your own outcomes' });
    }

    const outcomes = await LearningOutcome.find({ student_id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'booking_id',
        populate: { path: 'tutor_id', select: 'name profile_pic' }
      });

    // Group by subject
    const grouped = outcomes.reduce((acc, outcome) => {
      const subj = outcome.subject || 'General';
      if (!acc[subj]) acc[subj] = [];

      // Flatten structure to match frontend expectation
      const booking = outcome.booking_id;
      const flatOutcome = {
        id: outcome._id,
        subject: outcome.subject,
        indicator: outcome.indicator,
        before_level: outcome.before_level,
        after_level: outcome.after_level,
        delta_improvement: outcome.delta_improvement,
        created_at: outcome.createdAt,
        tutor_name: booking?.tutor_id?.name,
        tutor_pic: booking?.tutor_id?.profile_pic,
        session_date: booking?.scheduled_at
      };

      acc[subj].push(flatOutcome);
      return acc;
    }, {});

    // Calculate progress per subject
    const subjectProgress = {};
    for (const [subject, outcomeList] of Object.entries(grouped)) {
      const avgImprovement = outcomeList.reduce((sum, o) => sum + parseFloat(o.delta_improvement || 0), 0) / outcomeList.length;
      const latestLevel = outcomeList[0]?.after_level || 0;
      subjectProgress[subject] = {
        sessions: outcomeList.length,
        avg_improvement: Math.round(avgImprovement * 100) / 100,
        latest_level: latestLevel
      };
    }

    res.json({
      outcomes_by_subject: grouped,
      subject_progress: subjectProgress,
      total_outcomes: outcomes.length
    });
  } catch (error) {
    console.error('getStudentOutcomes error:', error);
    res.status(500).json({ error: 'Failed to fetch outcomes' });
  }
};

// Get tutor's feedback history
export const getTutorFeedback = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can view tutor feedback' });
    }

    const tutor = await Tutor.findOne({ user_id: req.user.id });
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const tutor_id = tutor._id;

    const feedbacks = await Feedback.find({ tutor_id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('student_id', 'name')
      .populate('booking_id', 'scheduled_at status');

    const response = feedbacks.map(f => ({
      id: f._id,
      rating: f.rating,
      comment: f.comment,
      created_at: f.createdAt,
      student_name: f.student_id?.name,
      booking_status: f.booking_id?.status,
      scheduled_at: f.booking_id?.scheduled_at
    }));

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(f => {
      if (distribution[f.rating] !== undefined) {
        distribution[f.rating]++;
      }
    });

    res.json({
      feedback: response,
      total: feedbacks.length,
      rating_distribution: distribution
    });
  } catch (error) {
    console.error('getTutorFeedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};
