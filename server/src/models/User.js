import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    location: { type: String, default: '' },

    // Time-bank economy: 1 credit == 1 hour of skill exchange.
    credits: { type: Number, default: 0, min: 0 },

    // Denormalised rating summary for quick display.
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    interests: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function toPublic() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
