import mongoose from 'mongoose';

let memoryServer = null;

/**
 * Connect to MongoDB.
 * - If MONGODB_URI is provided, connect to that (local or Atlas).
 * - Otherwise spin up an in-memory MongoDB so the app runs with zero setup.
 */
export async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    // Lazy-import so mongodb-memory-server is only loaded when actually needed.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    console.log('⏳ No MONGODB_URI set — starting in-memory MongoDB (demo mode)...');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('skillswap');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);

  const label = memoryServer ? 'in-memory MongoDB' : 'MongoDB';
  console.log(`✅ Connected to ${label}`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

export function isMemoryDB() {
  return Boolean(memoryServer);
}
