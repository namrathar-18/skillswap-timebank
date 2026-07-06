import mongoose from 'mongoose';

/**
 * A booked skill-exchange session between a learner and a teacher.
 * Credits are held/escrowed on request and settled on completion.
 */
const sessionSchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    credits: { type: Number, required: true, min: 1 },
    scheduledAt: { type: Date },
    message: { type: String, maxlength: 1000, default: '' },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Set once both sides have left a review (or the flow closes).
    reviewedByLearner: { type: Boolean, default: false },
    reviewedByTeacher: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
