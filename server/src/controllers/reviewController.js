import Review from '../models/Review.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.js';

/** Leave a review for the other party of a completed session. */
export const createReview = asyncHandler(async (req, res) => {
  const { sessionId, rating, comment } = req.body;
  const session = await Session.findById(sessionId);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (session.status !== 'completed') {
    return res.status(400).json({ message: 'You can only review completed sessions' });
  }

  const isTeacher = String(session.teacher) === String(req.user._id);
  const isLearner = String(session.learner) === String(req.user._id);
  if (!isTeacher && !isLearner) return res.status(403).json({ message: 'Not your session' });

  const reviewee = isTeacher ? session.learner : session.teacher;

  const review = await Review.create({
    session: session._id,
    reviewer: req.user._id,
    reviewee,
    rating,
    comment,
  });

  if (isTeacher) session.reviewedByTeacher = true;
  else session.reviewedByLearner = true;
  await session.save();

  // Recompute the reviewee's rating summary.
  const stats = await Review.aggregate([
    { $match: { reviewee } },
    { $group: { _id: '$reviewee', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats[0]) {
    await User.findByIdAndUpdate(reviewee, {
      ratingAvg: Math.round(stats[0].avg * 10) / 10,
      ratingCount: stats[0].count,
    });
  }

  res.status(201).json({ review });
});
