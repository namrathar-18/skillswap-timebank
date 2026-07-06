// Small presentational helpers reused across pages.

export function Avatar({ name = '?', src, size = 40 }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-2 ring-white"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ring-2 ring-white"
    >
      {initials}
    </div>
  );
}

export function Stars({ value = 0, count, size = 'text-sm' }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`} title={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? 'text-amber-400' : 'text-slate-300'}>
          ★
        </span>
      ))}
      {typeof count === 'number' && (
        <span className="ml-1 text-xs text-slate-400">({count})</span>
      )}
    </span>
  );
}

export function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function CreditPill({ value }) {
  return (
    <span className="badge gap-1 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
      <span aria-hidden>⏱</span> {value} credit{value === 1 ? '' : 's'}
    </span>
  );
}

const CATEGORY_STYLES = {
  Technology: 'bg-blue-50 text-blue-700',
  Design: 'bg-pink-50 text-pink-700',
  Languages: 'bg-purple-50 text-purple-700',
  Music: 'bg-amber-50 text-amber-700',
  Cooking: 'bg-orange-50 text-orange-700',
  Fitness: 'bg-green-50 text-green-700',
  Business: 'bg-cyan-50 text-cyan-700',
  Academics: 'bg-indigo-50 text-indigo-700',
  Crafts: 'bg-rose-50 text-rose-700',
  Lifestyle: 'bg-teal-50 text-teal-700',
  Other: 'bg-slate-100 text-slate-600',
};

export function CategoryBadge({ category }) {
  return <span className={`badge ${CATEGORY_STYLES[category] || CATEGORY_STYLES.Other}`}>{category}</span>;
}

export function EmptyState({ icon = '🗂', title, subtitle, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-12 text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="max-w-md text-sm text-slate-500">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
