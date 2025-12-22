import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor', // Reference to Tutor model (not User) for easier access
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model (student)
    required: true
  },
  scheduled_at: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  meeting_link: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

bookingSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
