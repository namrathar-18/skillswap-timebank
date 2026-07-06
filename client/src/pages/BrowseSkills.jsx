import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import SkillCard from '../components/SkillCard.jsx';
import { Spinner, EmptyState } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function BrowseSkills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', category: 'All' });
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/skills/categories').then(({ data }) => setCategories(['All', ...data.categories]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (filters.q) params.set('q', filters.q);
      if (filters.category !== 'All') params.set('category', filters.category);
      const { data } = await api.get(`/skills?${params.toString()}`);
      setSkills(data.skills);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Browse skills</h1>
          <p className="mt-1 text-slate-500">Find someone to learn from — spend credits, gain skills.</p>
        </div>
        {user && (
          <Link to="/skills/new" className="btn-primary">
            + Offer a skill
          </Link>
        )}
      </div>

      {/* Search + filters */}
      <div className="card space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            load();
          }}
          className="flex gap-2"
        >
          <input
            className="input"
            placeholder="Search skills, e.g. 'guitar', 'react', 'spanish'"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          <button className="btn-primary">Search</button>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setFilters({ ...filters, category: c });
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filters.category === c
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner label="Finding skills..." />
      ) : skills.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No skills found"
          subtitle="Try a different search or category — or be the first to teach this!"
          action={user && <Link to="/skills/new" className="btn-primary">Offer a skill</Link>}
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((s) => (
              <SkillCard key={s._id} skill={s} />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
