import Message, { threadId } from '../models/Message.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, body } = req.body;
  if (!body?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

  const recipient = await User.findById(recipientId);
  if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

  const message = await Message.create({
    thread: threadId(req.user._id, recipientId),
    sender: req.user._id,
    recipient: recipientId,
    body: body.trim(),
  });

  // Broadcast in real time if the recipient is connected.
  const io = req.app.get('io');
  if (io) io.to(`user:${recipientId}`).emit('message:new', await message.populate('sender', 'name avatar'));

  res.status(201).json({ message });
});

export const getThread = asyncHandler(async (req, res) => {
  const thread = threadId(req.user._id, req.params.userId);
  const messages = await Message.find({ thread })
    .populate('sender', 'name avatar')
    .sort('createdAt');

  await Message.updateMany(
    { thread, recipient: req.user._id, read: false },
    { read: true }
  );

  res.json({ messages });
});

export const listConversations = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { recipient: req.user._id }],
  })
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar')
    .sort('-createdAt');

  // Collapse to the latest message per thread.
  const seen = new Map();
  for (const m of messages) {
    if (!seen.has(m.thread)) seen.set(m.thread, m);
  }
  res.json({ conversations: Array.from(seen.values()) });
});
