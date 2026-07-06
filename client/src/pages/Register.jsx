import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '', bio: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setBusy(true);
    try {
      await register(form);
      toast.success('Welcome to SkillSwap! You got 3 free credits 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="card space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Join SkillSwap</h1>
          <p className="mt-1 text-sm text-slate-500">Get 3 free time-credits to start learning</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Location</label>
              <input
                className="input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City"
              />
            </div>
          </div>
          <div>
            <label className="label">Short bio <span className="text-slate-400">(optional)</span></label>
            <textarea
              className="input"
              rows={2}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="What are you passionate about?"
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full py-2.5">
            {busy ? 'Creating account...' : 'Create free account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
