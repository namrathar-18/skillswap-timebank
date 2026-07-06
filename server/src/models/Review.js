import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

reviewSchema.index({ session: 1, reviewer: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
