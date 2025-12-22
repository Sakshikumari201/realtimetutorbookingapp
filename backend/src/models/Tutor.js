import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  experience: {
    type: Number
  },
  bio: String,
  profile_pic: String,
  subjects: [String],
  languages: [String],
  hourly_rate: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews_count: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  availability: [{
    time_slot: Date,
    is_booked: {
      type: Boolean,
      default: false
    }
  }]
});

const Tutor = mongoose.model('Tutor', tutorSchema);
export default Tutor;
