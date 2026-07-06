import mongoose from 'mongoose';

export const SKILL_CATEGORIES = [
  'Technology',
  'Design',
  'Languages',
  'Music',
  'Cooking',
  'Fitness',
  'Business',
  'Academics',
  'Crafts',
  'Lifestyle',
  'Other',
];

const skillSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, enum: SKILL_CATEGORIES, default: 'Other', index: true },
    description: { type: String, required: true, maxlength: 2000 },
    tags: [{ type: String, lowercase: true, trim: true }],

    // How many time-credits (hours) a single session of this skill costs.
    creditsPerSession: { type: Number, default: 1, min: 1, max: 8 },

    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },

    isActive: { type: Boolean, default: true },
    sessionsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

skillSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Skill', skillSchema);
