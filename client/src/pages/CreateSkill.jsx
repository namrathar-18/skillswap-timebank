import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';

export default function CreateSkill() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Technology',
    level: 'Beginner',
    creditsPerSession: 1,
    tags: '',
    description: '',
  });

  useEffect(() => {
    api.get('/skills/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/skills', {
        ...form,
        creditsPerSession: Number(form.creditsPerSession),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Skill published! 🎉');
      navigate(`/skills/${data.skill._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Offer a skill</h1>
        <p className="mt-1 text-slate-500">Share what you can teach and start earning time-credits.</p>
      </div>

      <form onSubmit={submit} className="card space-y-5">
        <div>
          <label className="label">Skill title</label>
          <input required className="input" value={form.title} onChange={set('title')} placeholder="e.g. Intro to React" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set('category')}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Level</label>
            <select className="input" value={form.level} onChange={set('level')}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div>
            <label className="label">Credits / session</label>
            <input
              type="number"
              min={1}
              max={8}
              className="input"
              value={form.creditsPerSession}
              onChange={set('creditsPerSession')}
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            required
            rows={5}
            className="input"
            value={form.description}
            onChange={set('description')}
            placeholder="What will learners get out of a session? What should they bring?"
          />
        </div>

        <div>
          <label className="label">Tags <span className="text-slate-400">(comma separated)</span></label>
          <input className="input" value={form.tags} onChange={set('tags')} placeholder="react, javascript, frontend" />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button disabled={busy} className="btn-primary">
            {busy ? 'Publishing...' : 'Publish skill'}
          </button>
        </div>
      </form>
    </div>
  );
}
