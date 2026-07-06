import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar, Stars, Spinner, CategoryBadge, CreditPill } from '../components/ui.jsx';

export default function Profile() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const profileId = id || user?._id;
  const isMe = user && String(profileId) === String(user._id);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', location: '', interests: '' });

  useEffect(() => {
    setLoading(true);
    api
      .get(`/users/${profileId}`)
      .then(({ data }) => {
        setData(data);
        setForm({
          name: data.user.name,
          bio: data.user.bio || '',
          location: data.user.location || '',
          interests: (data.user.interests || []).join(', '),
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [profileId]);

  const save = async () => {
    try {
      const { data: res } = await api.put('/users/me', {
        ...form,
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setUser(res.user);
      setData((d) => ({ ...d, user: res.user }));
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner label="Loading profile..." />;
  if (!data) return <p className="text-center text-slate-500">Profile not found.</p>;

  const { user: profile, skills, reviews } = data;

  return (
    <div className="space-y-8">
      <div className="card flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar name={profile.name} src={profile.avatar} size={80} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Stars value={profile.ratingAvg || 0} count={profile.ratingCount} />
            {profile.location && <span>📍 {profile.location}</span>}
            {isMe && <span className="badge bg-emerald-50 text-emerald-700">⏱ {profile.credits} credits</span>}
          </div>
          {profile.bio && <p className="mt-2 text-slate-600">{profile.bio}</p>}
          {profile.interests?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="badge bg-brand-50 text-brand-600">
                  {i}
                </span>
              ))}
            </div>
          )}
        </div>
        {isMe && (
          <button onClick={() => setEditing((e) => !e)} className="btn-secondary">
            {editing ? 'Close' : 'Edit profile'}
          </button>
        )}
      </div>

      {editing && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Edit profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div>
            <label className="label">Interests <span className="text-slate-400">(comma separated)</span></label>
            <input className="input" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <button onClick={save} className="btn-primary">Save changes</button>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Skills {isMe ? 'you teach' : 'offered'}</h2>
          {skills.length === 0 ? (
            <p className="card text-sm text-slate-400">No skills listed yet.</p>
          ) : (
            skills.map((s) => (
              <Link key={s._id} to={`/skills/${s._id}`} className="card flex items-center justify-between hover:shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={s.category} />
                    <CreditPill value={s.creditsPerSession} />
                  </div>
                  <p className="mt-1 font-semibold text-slate-800">{s.title}</p>
                </div>
                <span className="text-brand-600">→</span>
              </Link>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="card text-sm text-slate-400">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="card space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.reviewer?.name} src={r.reviewer?.avatar} size={28} />
                    <span className="text-sm font-medium text-slate-700">{r.reviewer?.name}</span>
                  </div>
                  <Stars value={r.rating} />
                </div>
                {r.comment && <p className="text-sm text-slate-500">{r.comment}</p>}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
