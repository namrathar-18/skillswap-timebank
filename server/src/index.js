import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

import { connectDB, isMemoryDB } from './config/db.js';
import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';
import { maybeSeed } from './utils/seed.js';

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Gentle rate limit on the AI endpoint to protect the LLM key/budget.
app.use('/api/ai', rateLimit({ windowMs: 60 * 1000, max: 20 }));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', db: isMemoryDB() ? 'in-memory' : 'external', time: new Date().toISOString() })
);

app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev_insecure_secret_change_me';
    console.warn('⚠️  JWT_SECRET not set — using an insecure dev secret.');
  }

  await connectDB();
  await maybeSeed();

  const server = http.createServer(app);
  const io = new SocketServer(server, { cors: { origin: CLIENT_URL } });
  app.set('io', io);

  // Authenticate socket connections and join a per-user room.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
    } catch {
      /* allow anonymous sockets, they just won't receive DMs */
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.userId) socket.join(`user:${socket.userId}`);
  });

  server.listen(PORT, () => {
    console.log(`🚀 SkillSwap API running on http://localhost:${PORT}`);
    console.log(`   Allowed client origin: ${CLIENT_URL}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
