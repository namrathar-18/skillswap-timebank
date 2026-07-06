import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Back home
      </Link>
    </div>
  );
}
