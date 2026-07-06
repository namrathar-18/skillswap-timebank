import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar } from './ui.jsx';

const links = [
  { to: '/skills', label: 'Browse' },
  { to: '/dashboard', label: 'Dashboard', auth: true },
  { to: '/sessions', label: 'Sessions', auth: true },
  { to: '/messages', label: 'Messages', auth: true },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">S</span>
          SkillSwap
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links
            .filter((l) => !l.auth || user)
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 sm:inline-flex">
                ⏱ {user.credits}
              </span>
              <Link to="/profile" className="flex items-center gap-2">
                <Avatar name={user.name} src={user.avatar} size={34} />
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Join free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
