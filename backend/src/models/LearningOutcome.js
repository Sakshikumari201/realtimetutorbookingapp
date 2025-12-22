import mongoose from 'mongoose';

const learningOutcomeSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: String,
  indicator: String,
  before_level: Number,
  after_level: Number,
  delta_improvement: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for upsert logic (booking_id + indicator)
learningOutcomeSchema.index({ booking_id: 1, indicator: 1 }, { unique: true });

const LearningOutcome = mongoose.model('LearningOutcome', learningOutcomeSchema);
export default LearningOutcome;
