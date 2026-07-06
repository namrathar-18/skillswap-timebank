import { Link } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import api from '../api/client.js';
import SkillCard from '../components/SkillCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// 3D hero is heavy — load it lazily so it never blocks other pages.
const Hero3D = lazy(() => import('../components/Hero3D.jsx'));

const STEPS = [
  { icon: '🎓', title: 'Teach what you know', text: 'List a skill. Every hour you teach earns you one time-credit.' },
  { icon: '⏱', title: 'Earn time-credits', text: 'Credits are the currency. No money ever changes hands.' },
  { icon: '🚀', title: 'Learn anything', text: 'Spend your credits to book sessions and pick up new skills.' },
];

export default function Landing() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/skills?limit=3').then(({ data }) => setFeatured(data.skills)).catch(() => {});
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-6 animate-fade-in">
          <span className="badge bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            💡 A community Time Bank
          </span>
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Trade skills, not money.
            <span className="block text-brand-600">Everyone has something to teach.</span>
          </h1>
          <p className="max-w-lg text-lg text-slate-600">
            SkillSwap is a time bank where one hour of your time equals one credit. Teach guitar,
            earn credits, and spend them learning to code — all powered by an AI guide that plans
            your journey.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={user ? '/skills' : '/register'} className="btn-primary px-6 py-3 text-base">
              {user ? 'Browse skills' : 'Start swapping — free'}
            </Link>
            <Link to="/skills" className="btn-secondary px-6 py-3 text-base">
              Explore skills
            </Link>
          </div>
          <div className="flex items-center gap-6 pt-2 text-sm text-slate-500">
            <span>🤝 No fees, ever</span>
            <span>🤖 AI learning assistant</span>
          </div>
        </div>

        {/* Interactive 3D "skill network" — drag to explore */}
        <div className="relative h-[26rem] sm:h-[30rem]">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-brand-200/60 via-brand-100/40 to-transparent blur-2xl" />
          <div className="relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-slate-900 to-brand-900 ring-1 ring-white/10 shadow-2xl shadow-brand-900/20">
            <Suspense fallback={<div className="grid h-full place-items-center text-brand-200/70">Loading 3D scene…</div>}>
              <Hero3D />
            </Suspense>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-xs text-brand-100/80">
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">🌐 The SkillSwap community graph</span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">drag to rotate</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">How the Time Bank works</h2>
          <p className="mt-2 text-slate-500">Three simple steps to a fairer way of learning.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card space-y-3 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-3xl">
                {s.icon}
              </div>
              <h3 className="font-semibold text-slate-800">
                {i + 1}. {s.title}
              </h3>
              <p className="text-sm text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Fresh skills to learn</h2>
            <Link to="/skills" className="text-sm font-semibold text-brand-600 hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <SkillCard key={s._id} skill={s} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="overflow-hidden rounded-3xl bg-brand-600 px-8 py-14 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to swap your first skill?</h2>
        <p className="mx-auto mt-2 max-w-xl text-brand-100">
          Join a community that believes everyone has something worth teaching. Get 3 free credits
          when you sign up.
        </p>
        <Link to="/register" className="btn mt-6 bg-white px-8 py-3 text-base text-brand-700 hover:bg-brand-50">
          Create your free account
        </Link>
      </section>
    </div>
  );
}
