import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB, isMemoryDB } from '../config/db.js';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Transaction from '../models/Transaction.js';

const DEMO_USERS = [
  {
    name: 'Aisha Khan',
    email: 'aisha@demo.com',
    password: 'password123',
    location: 'Bengaluru',
    bio: 'Full-stack developer who loves teaching web dev to beginners.',
    interests: ['Guitar', 'Spanish'],
    credits: 8,
    skills: [
      { title: 'Intro to React', category: 'Technology', level: 'Beginner', creditsPerSession: 2, tags: ['react', 'javascript', 'frontend'], description: 'Build your first interactive React app from scratch. We cover components, props, state and hooks with a hands-on mini project.' },
      { title: 'Debugging Node.js APIs', category: 'Technology', level: 'Intermediate', creditsPerSession: 2, tags: ['node', 'backend', 'api'], description: 'Learn a systematic approach to finding and fixing bugs in Express APIs, using logging, the debugger and good tests.' },
    ],
  },
  {
    name: 'Diego Morales',
    email: 'diego@demo.com',
    password: 'password123',
    location: 'Madrid',
    bio: 'Native Spanish speaker and part-time chef.',
    interests: ['React', 'Photography'],
    credits: 5,
    skills: [
      { title: 'Conversational Spanish', category: 'Languages', level: 'Beginner', creditsPerSession: 1, tags: ['spanish', 'language', 'conversation'], description: 'Practice real conversations in Spanish. No boring grammar drills — we chat about travel, food and daily life.' },
      { title: 'Cook Authentic Paella', category: 'Cooking', level: 'Beginner', creditsPerSession: 1, tags: ['cooking', 'spanish', 'food'], description: 'A live cook-along where we make a classic seafood paella together. I share the family secrets!' },
    ],
  },
  {
    name: 'Mei Lin',
    email: 'mei@demo.com',
    password: 'password123',
    location: 'Singapore',
    bio: 'UX designer and watercolor hobbyist.',
    interests: ['Node', 'Cooking'],
    credits: 6,
    skills: [
      { title: 'Figma for Beginners', category: 'Design', level: 'Beginner', creditsPerSession: 1, tags: ['figma', 'ux', 'design'], description: 'Get comfortable with Figma: frames, components, auto-layout and prototyping your first screen.' },
      { title: 'Watercolour Basics', category: 'Crafts', level: 'Beginner', creditsPerSession: 1, tags: ['painting', 'art', 'watercolour'], description: 'A relaxing intro to watercolour painting. Learn washes, blending and how to paint a simple landscape.' },
    ],
  },
  {
    name: 'Sam Okoye',
    email: 'sam@demo.com',
    password: 'password123',
    location: 'Lagos',
    bio: 'Music teacher and fitness enthusiast.',
    interests: ['Design', 'Spanish'],
    credits: 4,
    skills: [
      { title: 'Guitar for Absolute Beginners', category: 'Music', level: 'Beginner', creditsPerSession: 1, tags: ['guitar', 'music'], description: 'Learn your first chords and strum a full song by the end of the session. Bring any acoustic guitar.' },
      { title: 'Home Workout Coaching', category: 'Fitness', level: 'Beginner', creditsPerSession: 1, tags: ['fitness', 'workout', 'health'], description: 'A personalised no-equipment workout plan plus a live-form check so you exercise safely at home.' },
    ],
  },
];

export async function seedDatabase() {
  await User.deleteMany({});
  await Skill.deleteMany({});
  await Transaction.deleteMany({});

  for (const data of DEMO_USERS) {
    const { skills, ...userData } = data;
    const user = await User.create(userData);
    await Transaction.create({
      user: user._id,
      amount: user.credits,
      balanceAfter: user.credits,
      type: 'signup_bonus',
      note: 'Seed starting balance',
    });
    for (const s of skills) {
      await Skill.create({ ...s, owner: user._id });
    }
  }

  console.log(`🌱 Seeded ${DEMO_USERS.length} demo members and their skills.`);
  console.log('   Try logging in with aisha@demo.com / password123');
}

/** Auto-seed only when using the throwaway in-memory DB and it's empty. */
export async function maybeSeed() {
  if (!isMemoryDB()) return;
  const count = await User.countDocuments();
  if (count === 0) await seedDatabase();
}

// Allow running `npm run seed` directly against a real DB.
const isDirectRun = process.argv[1] && process.argv[1].endsWith('seed.js');
if (isDirectRun) {
  (async () => {
    await connectDB();
    if (isMemoryDB()) {
      console.warn('No MONGODB_URI set — seeding an in-memory DB will not persist. Set MONGODB_URI to seed a real database.');
    }
    await seedDatabase();
    await disconnectDB();
    await mongoose.connection.close();
    process.exit(0);
  })();
}
