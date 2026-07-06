import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => setForm({ email: 'aisha@demo.com', password: 'password123' });

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="card space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to your time bank</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
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
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full py-2.5">
            {busy ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        <button onClick={fillDemo} className="btn-secondary w-full text-xs">
          Use demo account (aisha@demo.com)
        </button>

        <p className="text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
