import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * Adjust a user's credit balance and record a ledger entry atomically-ish.
 * (Single-node dev DB; for production this would use a transaction/session.)
 */
export async function adjustCredits(userId, amount, type, { session, note = '' } = {}) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found for credit adjustment');

  const newBalance = user.credits + amount;
  if (newBalance < 0) {
    const err = new Error('Insufficient time-credits');
    err.status = 400;
    throw err;
  }

  user.credits = newBalance;
  await user.save();

  await Transaction.create({
    user: userId,
    amount,
    balanceAfter: newBalance,
    type,
    session: session || undefined,
    note,
  });

  return newBalance;
}

/** Move credits from learner to teacher when a session completes. */
export async function settleSession(sessionDoc) {
  await adjustCredits(sessionDoc.learner, -sessionDoc.credits, 'spent', {
    session: sessionDoc._id,
    note: 'Session completed — paid teacher',
  });
  await adjustCredits(sessionDoc.teacher, sessionDoc.credits, 'earned', {
    session: sessionDoc._id,
    note: 'Session completed — taught learner',
  });
}
