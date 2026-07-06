import { Link } from 'react-router-dom';
import { Avatar, CategoryBadge, CreditPill, Stars } from './ui.jsx';

export default function SkillCard({ skill }) {
  const owner = skill.owner || {};
  return (
    <Link
      to={`/skills/${skill._id}`}
      className="card group flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryBadge category={skill.category} />
        <CreditPill value={skill.creditsPerSession} />
      </div>

      <div>
        <h3 className="font-semibold text-slate-800 group-hover:text-brand-700">{skill.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{skill.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-3">
        <div className="flex items-center gap-2">
          <Avatar name={owner.name} src={owner.avatar} size={28} />
          <span className="text-sm text-slate-600">{owner.name}</span>
        </div>
        <Stars value={owner.ratingAvg || 0} count={owner.ratingCount} />
      </div>
    </Link>
  );
}
