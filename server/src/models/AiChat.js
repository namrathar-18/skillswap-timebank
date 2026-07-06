import mongoose from 'mongoose';

/** Persisted conversation with the AI learning assistant, one doc per user. */
const aiMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { _id: false, timestamps: true }
);

const aiChatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    messages: [aiMessageSchema],
  },
  { timestamps: true }
);

export default mongoose.model('AiChat', aiChatSchema);
