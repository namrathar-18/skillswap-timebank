import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CategoryBadge, CreditPill, Spinner, EmptyState } from '../components/ui.jsx';

const TX_LABEL = {
  signup_bonus: '🎁 Welcome bonus',
  earned: '📈 Taught a session',
  spent: '📚 Learned a session',
  refund: '↩️ Refund',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/skills?owner=${user._id}&limit=48`),
      api.get('/users/me/transactions'),
    ])
      .then(([skillsRes, txRes]) => {
        setMySkills(skillsRes.data.skills);
        setLedger(txRes.data.transactions);
      })
      .finally(() => setLoading(false));
  }, [user._id]);

  const removeSkill = async (id) => {
    try {
      await api.delete(`/skills/${id}`);
      setMySkills((s) => s.filter((x) => x._id !== id));
      toast.success('Skill removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const earned = ledger.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const spent = ledger.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  if (loading) return <Spinner label="Loading your dashboard..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hi, {user.name.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-slate-500">Here's your time bank at a glance.</p>
        </div>
        <Link to="/skills/new" className="btn-primary">
          + Offer a skill
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card bg-gradient-to-br from-brand-600 to-brand-500 text-white">
          <p className="text-sm text-brand-100">Credit balance</p>
          <p className="mt-1 text-4xl font-extrabold">⏱ {user.credits}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Credits earned</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">+{earned}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Credits spent</p>
          <p className="mt-1 text-3xl font-bold text-slate-700">-{spent}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* My skills */}
        <section className="space-y-4 lg:col-span-3">
          <h2 className="text-xl font-bold text-slate-900">Skills you teach</h2>
          {mySkills.length === 0 ? (
            <EmptyState
              icon="🎓"
              title="You haven't listed a skill yet"
              subtitle="Teach something you love and start earning credits."
              action={<Link to="/skills/new" className="btn-primary">Offer your first skill</Link>}
            />
          ) : (
            <div className="space-y-3">
              {mySkills.map((s) => (
                <div key={s._id} className="card flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={s.category} />
                      <CreditPill value={s.creditsPerSession} />
                    </div>
                    <Link to={`/skills/${s._id}`} className="mt-1 block truncate font-semibold text-slate-800 hover:text-brand-700">
                      {s.title}
                    </Link>
                    <p className="text-xs text-slate-400">{s.sessionsCompleted} sessions completed</p>
                  </div>
                  <button onClick={() => removeSkill(s._id)} className="btn-ghost text-sm text-red-500 hover:bg-red-50">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ledger */}
        <section className="space-y-4 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Credit history</h2>
          <div className="card divide-y divide-slate-50">
            {ledger.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No transactions yet.</p>
            ) : (
              ledger.slice(0, 12).map((t) => (
                <div key={t._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{TX_LABEL[t.type] || t.type}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()} · balance {t.balanceAfter}
                    </p>
                  </div>
                  <span className={`font-semibold ${t.amount >= 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {t.amount >= 0 ? '+' : ''}
                    {t.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
