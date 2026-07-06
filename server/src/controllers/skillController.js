import Skill, { SKILL_CATEGORIES } from '../models/Skill.js';
import { asyncHandler } from '../middleware/error.js';

export const listCategories = (req, res) => res.json({ categories: SKILL_CATEGORIES });

export const listSkills = asyncHandler(async (req, res) => {
  const { q, category, level, page = 1, limit = 12, owner } = req.query;
  const filter = { isActive: true };

  if (category && category !== 'All') filter.category = category;
  if (level) filter.level = level;
  if (owner) filter.owner = owner;
  if (q) filter.$text = { $search: q };

  const pageNum = Math.max(1, Number(page));
  const perPage = Math.min(48, Math.max(1, Number(limit)));

  const [skills, total] = await Promise.all([
    Skill.find(filter)
      .populate('owner', 'name avatar ratingAvg ratingCount location')
      .sort(q ? { score: { $meta: 'textScore' } } : '-createdAt')
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    Skill.countDocuments(filter),
  ]);

  res.json({ skills, total, page: pageNum, pages: Math.ceil(total / perPage) });
});

export const getSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id).populate(
    'owner',
    'name avatar bio ratingAvg ratingCount location credits'
  );
  if (!skill) return res.status(404).json({ message: 'Skill not found' });
  res.json({ skill });
});

export const createSkill = asyncHandler(async (req, res) => {
  const { title, category, description, tags, creditsPerSession, level } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  const skill = await Skill.create({
    owner: req.user._id,
    title,
    category,
    description,
    tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    creditsPerSession,
    level,
  });
  res.status(201).json({ skill });
});

export const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) return res.status(404).json({ message: 'Skill not found' });
  if (String(skill.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only edit your own skills' });
  }

  const allowed = ['title', 'category', 'description', 'tags', 'creditsPerSession', 'level', 'isActive'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) skill[key] = req.body[key];
  }
  await skill.save();
  res.json({ skill });
});

export const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) return res.status(404).json({ message: 'Skill not found' });
  if (String(skill.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only remove your own skills' });
  }
  skill.isActive = false;
  await skill.save();
  res.json({ message: 'Skill removed' });
});
