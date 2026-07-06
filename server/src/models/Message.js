import mongoose from 'mongoose';

/** Direct messages between two members, grouped by a deterministic thread id. */
const messageSchema = new mongoose.Schema(
  {
    thread: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/** Build a stable thread id from two user ids (order-independent). */
export function threadId(a, b) {
  return [String(a), String(b)].sort().join('_');
}

export default mongoose.model('Message', messageSchema);
