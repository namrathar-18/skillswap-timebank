import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { Avatar, CategoryBadge, CreditPill, Stars, Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function SkillDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    api
      .get(`/skills/${id}`)
      .then(({ data }) => setSkill(data.skill))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading skill..." />;
  if (!skill) return <p className="text-center text-slate-500">Skill not found.</p>;

  const owner = skill.owner || {};
  const isOwner = user && String(user._id) === String(owner._id);

  const book = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: `/skills/${id}` } });
    setBooking(true);
    try {
      await api.post('/sessions', { skillId: skill._id, message, scheduledAt: scheduledAt || undefined });
      await refreshUser();
      toast.success('Request sent! The teacher will confirm your session.');
      navigate('/sessions');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Link to="/skills" className="text-sm text-brand-600 hover:underline">
          ← Back to skills
        </Link>

        <div className="card space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={skill.category} />
            <span className="badge bg-slate-100 text-slate-600">{skill.level}</span>
            <CreditPill value={skill.creditsPerSession} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">{skill.title}</h1>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-600">{skill.description}</p>

          {skill.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {skill.tags.map((t) => (
                <span key={t} className="badge bg-brand-50 text-brand-600">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <span>✅ {skill.sessionsCompleted} sessions completed</span>
          </div>
        </div>
      </div>

      {/* Sidebar: teacher + booking */}
      <div className="space-y-5">
        <div className="card space-y-4">
          <Link to={`/users/${owner._id}`} className="flex items-center gap-3">
            <Avatar name={owner.name} src={owner.avatar} size={52} />
            <div>
              <p className="font-semibold text-slate-800">{owner.name}</p>
              <Stars value={owner.ratingAvg || 0} count={owner.ratingCount} />
              {owner.location && <p className="text-xs text-slate-400">📍 {owner.location}</p>}
            </div>
          </Link>
          {owner.bio && <p className="text-sm text-slate-500">{owner.bio}</p>}
        </div>

        {isOwner ? (
          <div className="card text-center text-sm text-slate-500">
            This is your skill. Manage it from your{' '}
            <Link to="/dashboard" className="font-semibold text-brand-600">
              dashboard
            </Link>
            .
          </div>
        ) : (
          <form onSubmit={book} className="card space-y-4">
            <h3 className="font-semibold text-slate-800">Book a session</h3>
            <p className="text-sm text-slate-500">
              Costs <b>{skill.creditsPerSession} credit(s)</b>. You have{' '}
              <b>{user ? user.credits : '—'}</b>.
            </p>
            <div>
              <label className="label">Preferred time (optional)</label>
              <input
                type="datetime-local"
                className="input"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Message to teacher</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Hi! I'd love to learn about..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button disabled={booking} className="btn-primary w-full">
              {booking ? 'Sending...' : user ? 'Request session' : 'Log in to book'}
            </button>
            {user && (
              <Link to={`/messages/${owner._id}`} className="btn-secondary w-full">
                💬 Message first
              </Link>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
