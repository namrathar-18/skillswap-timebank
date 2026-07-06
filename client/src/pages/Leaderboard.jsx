import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { Avatar, Stars, Spinner } from '../components/ui.jsx';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/users/leaderboard')
      .then(({ data }) => setLeaders(data.leaderboard))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading leaderboard..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">🏆 Top swappers</h1>
        <p className="mt-1 text-slate-500">Members giving the most to the community.</p>
      </div>

      <div className="card divide-y divide-slate-50">
        {leaders.map((u, i) => (
          <Link
            key={u._id}
            to={`/users/${u._id}`}
            className="flex items-center gap-4 py-3 transition hover:bg-slate-50 first:pt-0 last:pb-0"
          >
            <span className="w-8 text-center text-lg font-bold text-slate-400">
              {MEDALS[i] || i + 1}
            </span>
            <Avatar name={u.name} src={u.avatar} size={44} />
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{u.name}</p>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Stars value={u.ratingAvg || 0} count={u.ratingCount} />
                {u.location && <span>📍 {u.location}</span>}
              </div>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">⏱ {u.credits}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
