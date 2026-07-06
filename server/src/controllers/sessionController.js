import Session from '../models/Session.js';
import Skill from '../models/Skill.js';
import { asyncHandler } from '../middleware/error.js';
import { settleSession } from '../services/timebank.js';

/** Learner requests a session for a skill. Credits are checked but only moved on completion. */
export const requestSession = asyncHandler(async (req, res) => {
  const { skillId, message, scheduledAt } = req.body;
  const skill = await Skill.findById(skillId);
  if (!skill || !skill.isActive) return res.status(404).json({ message: 'Skill not available' });

  if (String(skill.owner) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot book your own skill' });
  }
  if (req.user.credits < skill.creditsPerSession) {
    return res.status(400).json({
      message: `You need ${skill.creditsPerSession} credit(s) but only have ${req.user.credits}. Teach a skill to earn more!`,
    });
  }

  const session = await Session.create({
    skill: skill._id,
    teacher: skill.owner,
    learner: req.user._id,
    credits: skill.creditsPerSession,
    message,
    scheduledAt,
  });

  res.status(201).json({ session });
});

export const listMySessions = asyncHandler(async (req, res) => {
  const { role } = req.query; // 'teaching' | 'learning' | undefined
  const filter =
    role === 'teaching'
      ? { teacher: req.user._id }
      : role === 'learning'
      ? { learner: req.user._id }
      : { $or: [{ teacher: req.user._id }, { learner: req.user._id }] };

  const sessions = await Session.find(filter)
    .populate('skill', 'title category')
    .populate('teacher', 'name avatar')
    .populate('learner', 'name avatar')
    .sort('-createdAt');

  res.json({ sessions });
});

/** Teacher accepts or declines a pending request. */
export const respondToSession = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'accept' | 'decline'
  const session = await Session.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (String(session.teacher) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Only the teacher can respond to this request' });
  }
  if (session.status !== 'pending') {
    return res.status(400).json({ message: `Session already ${session.status}` });
  }

  session.status = action === 'accept' ? 'accepted' : 'declined';
  await session.save();
  res.json({ session });
});

/** Learner (or teacher) marks an accepted session complete → credits settle. */
export const completeSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id).populate('skill');
  if (!session) return res.status(404).json({ message: 'Session not found' });

  const isParticipant =
    String(session.teacher) === String(req.user._id) ||
    String(session.learner) === String(req.user._id);
  if (!isParticipant) return res.status(403).json({ message: 'Not your session' });
  if (session.status !== 'accepted') {
    return res.status(400).json({ message: 'Only accepted sessions can be completed' });
  }

  await settleSession(session);

  session.status = 'completed';
  await session.save();

  if (session.skill) {
    await Skill.findByIdAndUpdate(session.skill._id, { $inc: { sessionsCompleted: 1 } });
  }

  res.json({ session, message: 'Session completed and credits transferred' });
});

export const cancelSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  const isParticipant =
    String(session.teacher) === String(req.user._id) ||
    String(session.learner) === String(req.user._id);
  if (!isParticipant) return res.status(403).json({ message: 'Not your session' });
  if (['completed', 'declined'].includes(session.status)) {
    return res.status(400).json({ message: `Cannot cancel a ${session.status} session` });
  }
  session.status = 'cancelled';
  await session.save();
  res.json({ session });
});
