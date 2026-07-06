import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar, Spinner, EmptyState } from '../components/ui.jsx';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  declined: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-slate-100 text-slate-500',
};

function ReviewModal({ session, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api.post('/reviews', { sessionId: session._id, rating, comment });
      toast.success('Thanks for your review!');
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900">Leave a review</h3>
        <p className="text-sm text-slate-500">How was your "{session.skill?.title}" session?</p>
        <div className="flex justify-center gap-2 text-3xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} className={n <= rating ? 'text-amber-400' : 'text-slate-300'}>
              ★
            </button>
          ))}
        </div>
        <textarea
          className="input"
          rows={3}
          placeholder="Share a few words (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={submit} disabled={busy} className="btn-primary">
            {busy ? 'Submitting...' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sessions() {
  const { user, refreshUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('learning');
  const [reviewFor, setReviewFor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sessions');
      setSessions(data.sessions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, fn, successMsg) => {
    try {
      await fn();
      await load();
      await refreshUser();
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const learning = sessions.filter((s) => String(s.learner?._id) === String(user._id));
  const teaching = sessions.filter((s) => String(s.teacher?._id) === String(user._id));
  const list = tab === 'learning' ? learning : teaching;

  if (loading) return <Spinner label="Loading your sessions..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sessions</h1>
        <p className="mt-1 text-slate-500">Manage your bookings and confirm completed swaps.</p>
      </div>

      <div className="flex gap-2">
        {[
          ['learning', `Learning (${learning.length})`],
          ['teaching', `Teaching (${teaching.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="📅"
          title={tab === 'learning' ? 'No sessions booked yet' : 'No teaching requests yet'}
          subtitle={
            tab === 'learning'
              ? 'Browse skills and request your first session.'
              : 'When someone books your skill, it will show up here.'
          }
          action={<Link to="/skills" className="btn-primary">Browse skills</Link>}
        />
      ) : (
        <div className="space-y-3">
          {list.map((s) => {
            const other = tab === 'learning' ? s.teacher : s.learner;
            const alreadyReviewed = tab === 'learning' ? s.reviewedByLearner : s.reviewedByTeacher;
            return (
              <div key={s._id} className="card flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={other?.name} src={other?.avatar} size={44} />
                  <div>
                    <p className="font-semibold text-slate-800">{s.skill?.title || 'Skill'}</p>
                    <p className="text-sm text-slate-500">
                      {tab === 'learning' ? 'with' : 'requested by'} {other?.name} · {s.credits} credit(s)
                    </p>
                    {s.scheduledAt && (
                      <p className="text-xs text-slate-400">🕒 {new Date(s.scheduledAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`badge ${STATUS_STYLES[s.status]}`}>{s.status}</span>

                  {/* Teacher actions on pending */}
                  {tab === 'teaching' && s.status === 'pending' && (
                    <>
                      <button
                        onClick={() =>
                          act(s._id, () => api.post(`/sessions/${s._id}/respond`, { action: 'accept' }), 'Accepted!')
                        }
                        className="btn-primary text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          act(s._id, () => api.post(`/sessions/${s._id}/respond`, { action: 'decline' }))
                        }
                        className="btn-secondary text-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {/* Complete an accepted session */}
                  {s.status === 'accepted' && (
                    <button
                      onClick={() =>
                        act(s._id, () => api.post(`/sessions/${s._id}/complete`), 'Session completed & credits settled!')
                      }
                      className="btn-primary text-sm"
                    >
                      Mark complete
                    </button>
                  )}

                  {/* Review after completion */}
                  {s.status === 'completed' &&
                    (alreadyReviewed ? (
                      <span className="text-xs text-slate-400">Reviewed ✓</span>
                    ) : (
                      <button onClick={() => setReviewFor(s)} className="btn-secondary text-sm">
                        Leave review
                      </button>
                    ))}

                  {['pending', 'accepted'].includes(s.status) && (
                    <button
                      onClick={() => act(s._id, () => api.post(`/sessions/${s._id}/cancel`), 'Cancelled')}
                      className="btn-ghost text-sm text-slate-400"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewFor && (
        <ReviewModal
          session={reviewFor}
          onClose={() => setReviewFor(null)}
          onDone={() => {
            setReviewFor(null);
            load();
          }}
        />
      )}
    </div>
  );
}
