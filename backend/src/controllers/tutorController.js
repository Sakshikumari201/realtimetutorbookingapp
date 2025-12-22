// Tutor matching engine with score calculation
import Tutor from '../models/Tutor.js';

// Search tutors by subject/budget with match scores
export const getTutorsByQuery = async (req, res) => {
  try {
    const { subject, student_level, budget_per_hour, preferred_times } = req.body;

    if (!subject || !budget_per_hour) {
      return res.status(400).json({ error: 'Missing required fields: subject and budget_per_hour' });
    }

    // Filter by subject and budget
    const tutors = await Tutor.find({
      subjects: { $in: [subject] },
      hourly_rate: { $lte: budget_per_hour },
      is_active: true
    }).limit(20);

    const tutorsWithScores = tutors.map(tutor => {
      // Filter availability for future open slots (or recently passed for demo)
      const validSlots = tutor.availability.filter(slot =>
        !slot.is_booked && new Date(slot.time_slot) > new Date(Date.now() - 1000 * 60 * 60) // Show slots from 1 hour ago onwards
      );

      return {
        id: tutor._id,
        user_id: tutor.user_id,
        name: tutor.name,
        bio: tutor.bio,
        profile_pic: tutor.profile_pic,
        hourly_rate: tutor.hourly_rate,
        rating: tutor.rating,
        reviews_count: tutor.reviews_count,
        subjects: tutor.subjects,
        languages: tutor.languages,
        available_slots: validSlots.map(s => ({ slot: s.time_slot, id: s._id })),
        match_score: calculateMatchScore(tutor, { student_level, budget_per_hour, preferred_times }, validSlots)
      };
    });

    tutorsWithScores.sort((a, b) => b.match_score - a.match_score);

    res.json({ tutors: tutorsWithScores.slice(0, 5), total_found: tutors.length });
  } catch (error) {
    console.error('getTutorsByQuery error:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};

// Score formula: subject(0.4) + rating(0.3) + price(0.2) + availability(0.1)
const calculateMatchScore = (tutor, criteria, validSlots) => {
  const subject_match = 1.0;
  const rating_norm = Math.min(tutor.rating / 5, 1);
  const price_fit = tutor.hourly_rate <= criteria.budget_per_hour
    ? 1 - (tutor.hourly_rate / criteria.budget_per_hour) * 0.5
    : 0;
  const hasSlots = validSlots && validSlots.length > 0;
  const availability_fit = hasSlots ? 1.0 : 0.3;

  const score = (subject_match * 0.4) + (rating_norm * 0.3) + (price_fit * 0.2) + (availability_fit * 0.1);
  return Math.round(score * 100) / 100;
};

// Get single tutor by ID
export const getTutorById = async (req, res) => {
  try {
    const { tutor_id } = req.params;

    const tutor = await Tutor.findById(tutor_id);

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Filter availability
    const validSlots = tutor.availability.filter(slot =>
      !slot.is_booked && new Date(slot.time_slot) > new Date(Date.now() - 1000 * 60 * 60)
    );

    const response = {
      id: tutor._id,
      user_id: tutor.user_id,
      name: tutor.name,
      subject: tutor.subject,
      experience: tutor.experience,
      bio: tutor.bio,
      profile_pic: tutor.profile_pic,
      hourly_rate: tutor.hourly_rate,
      rating: tutor.rating,
      reviews_count: tutor.reviews_count,
      subjects: tutor.subjects,
      languages: tutor.languages,
      is_active: tutor.is_active,
      available_slots: validSlots.map(s => ({ slot: s.time_slot, id: s._id }))
    };

    res.json(response);
  } catch (error) {
    console.error('getTutorById error:', error);
    res.status(500).json({ error: 'Failed to fetch tutor' });
  }
};

// Get all active tutors
export const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({ is_active: true })
      .sort({ rating: -1 })
      .limit(20)
      .select('name subject experience bio profile_pic hourly_rate rating reviews_count subjects languages');

    // Create simpler objects with id and badges
    const response = tutors.map(t => {
      let badge = null;
      if (t.rating >= 4.8 && t.reviews_count >= 50) badge = 'Gold';
      else if (t.rating >= 4.5 && t.reviews_count >= 20) badge = 'Silver';
      else if (t.rating >= 4.0 && t.reviews_count >= 5) badge = 'Bronze';

      return {
        ...t.toObject(),
        id: t._id,
        badge
      };
    });

    res.json({ tutors: response, total: tutors.length });
  } catch (error) {
    console.error('getAllTutors error:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};
