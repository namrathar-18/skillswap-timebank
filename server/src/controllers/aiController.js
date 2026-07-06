import AiChat from '../models/AiChat.js';
import Skill from '../models/Skill.js';
import { asyncHandler } from '../middleware/error.js';
import { generateReply, getProviderInfo } from '../services/aiService.js';

export const status = (req, res) => {
  const { provider, configured } = getProviderInfo();
  res.json({ provider, configured });
};

export const getHistory = asyncHandler(async (req, res) => {
  const chat = await AiChat.findOne({ user: req.user._id });
  res.json({ messages: chat?.messages || [] });
});

export const clearHistory = asyncHandler(async (req, res) => {
  await AiChat.findOneAndUpdate(
    { user: req.user._id },
    { messages: [] },
    { upsert: true }
  );
  res.json({ message: 'Conversation cleared' });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

  const chat =
    (await AiChat.findOne({ user: req.user._id })) ||
    new AiChat({ user: req.user._id, messages: [] });

  // Build helpful context for the assistant.
  const [mySkills, popular] = await Promise.all([
    Skill.find({ owner: req.user._id, isActive: true }).select('title').limit(10),
    Skill.find({ isActive: true }).sort('-sessionsCompleted').select('title').limit(6),
  ]);

  const context = {
    userName: req.user.name,
    credits: req.user.credits,
    interests: req.user.interests,
    mySkills: mySkills.map((s) => s.title),
    popularSkills: popular.map((s) => s.title),
  };

  const reply = await generateReply(chat.messages, message.trim(), context);

  chat.messages.push({ role: 'user', content: message.trim() });
  chat.messages.push({ role: 'assistant', content: reply });
  // Keep the stored history bounded.
  if (chat.messages.length > 40) chat.messages = chat.messages.slice(-40);
  await chat.save();

  res.json({ reply });
});
