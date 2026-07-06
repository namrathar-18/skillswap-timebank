import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middleware/error.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const [skills, reviews] = await Promise.all([
    Skill.find({ owner: user._id, isActive: true }).sort('-createdAt'),
    Review.find({ reviewee: user._id })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt')
      .limit(20),
  ]);

  res.json({ user: user.toPublic(), skills, reviews });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'bio', 'location', 'avatar', 'interests'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ user: user.toPublic() });
});

export const getMyTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .populate('session', 'skill')
    .sort('-createdAt')
    .limit(100);
  res.json({ transactions, balance: req.user.credits });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const top = await User.find()
    .sort('-credits -ratingAvg')
    .limit(10)
    .select('name avatar credits ratingAvg ratingCount location');
  res.json({ leaderboard: top });
});
