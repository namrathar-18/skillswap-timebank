import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { signToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, bio, location, interests } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const bonus = Number(process.env.SIGNUP_BONUS_CREDITS ?? 3);
  const user = await User.create({
    name,
    email,
    password,
    bio,
    location,
    interests,
    credits: bonus,
  });

  if (bonus > 0) {
    await Transaction.create({
      user: user._id,
      amount: bonus,
      balanceAfter: bonus,
      type: 'signup_bonus',
      note: 'Welcome bonus for joining SkillSwap',
    });
  }

  const token = signToken(user._id);
  res.status(201).json({ token, user: user.toPublic() });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user._id);
  res.json({ token, user: user.toPublic() });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublic() });
});
