import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActionDate: {
    type: Date,
    default: Date.now
  },
  grade_level: String,
  subjects_interested: [String]
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
