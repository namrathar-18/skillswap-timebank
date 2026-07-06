import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as users from '../controllers/userController.js';
import * as skills from '../controllers/skillController.js';
import * as sessions from '../controllers/sessionController.js';
import * as reviews from '../controllers/reviewController.js';
import * as messages from '../controllers/messageController.js';
import * as ai from '../controllers/aiController.js';

const router = Router();

// --- Auth ---
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);

// --- Users ---
router.get('/users/leaderboard', users.getLeaderboard);
router.get('/users/me/transactions', protect, users.getMyTransactions);
router.put('/users/me', protect, users.updateProfile);
router.get('/users/:id', users.getProfile);

// --- Skills ---
router.get('/skills/categories', skills.listCategories);
router.get('/skills', skills.listSkills);
router.post('/skills', protect, skills.createSkill);
router.get('/skills/:id', skills.getSkill);
router.put('/skills/:id', protect, skills.updateSkill);
router.delete('/skills/:id', protect, skills.deleteSkill);

// --- Sessions (bookings) ---
router.get('/sessions', protect, sessions.listMySessions);
router.post('/sessions', protect, sessions.requestSession);
router.post('/sessions/:id/respond', protect, sessions.respondToSession);
router.post('/sessions/:id/complete', protect, sessions.completeSession);
router.post('/sessions/:id/cancel', protect, sessions.cancelSession);

// --- Reviews ---
router.post('/reviews', protect, reviews.createReview);

// --- Messages ---
router.get('/messages', protect, messages.listConversations);
router.post('/messages', protect, messages.sendMessage);
router.get('/messages/:userId', protect, messages.getThread);

// --- AI assistant ---
router.get('/ai/status', ai.status);
router.get('/ai/history', protect, ai.getHistory);
router.post('/ai/chat', protect, ai.sendMessage);
router.delete('/ai/history', protect, ai.clearHistory);

export default router;
