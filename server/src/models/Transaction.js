import mongoose from 'mongoose';

/**
 * Immutable ledger of every time-credit movement, so a member can audit
 * exactly how their balance changed (signup bonus, earnings, spending).
 */
const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true }, // positive = earned, negative = spent
    balanceAfter: { type: Number, required: true },
    type: {
      type: String,
      enum: ['signup_bonus', 'earned', 'spent', 'refund'],
      required: true,
    },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
