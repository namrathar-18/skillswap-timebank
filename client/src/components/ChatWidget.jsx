import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

const SUGGESTIONS = [
  'How does the Time Bank work?',
  'What could I teach to earn credits?',
  'Suggest a learning path for web development',
  'I have 3 credits — what should I learn first?',
];

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ configured: true, provider: '' });
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get('/ai/status').then(({ data }) => setStatus(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (open && user) {
      api
        .get('/ai/history')
        .then(({ data }) => setMessages(data.messages || []))
        .catch(() => {});
    }
  }, [open, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  if (!user) return null; // assistant is for signed-in members

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content }]);
    setSending(true);
    try {
      const { data } = await api.post('/ai/chat', { message: content });
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `⚠️ ${err.message}`, error: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const clear = async () => {
    await api.delete('/ai/history').catch(() => {});
    setMessages([]);
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg shadow-brand-600/30 transition hover:scale-105 hover:bg-brand-700"
        aria-label="Open AI assistant"
      >
        {open ? '×' : '🤖'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-fade-in">
          <div className="flex items-center justify-between bg-brand-600 px-4 py-3 text-white">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <span>Skilly</span>
                <span className="badge bg-white/20 text-[10px] text-white">AI assistant</span>
              </p>
              <p className="text-xs text-brand-100">Your skill-learning guide</p>
            </div>
            <button onClick={clear} className="text-xs text-brand-100 hover:text-white" title="Clear conversation">
              Clear
            </button>
          </div>

          <div ref={scrollRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm">
                  Hi {user.name.split(' ')[0]} 👋 I'm <b>Skilly</b>. Ask me what to learn or teach,
                  how time-credits work, or for a learning plan.
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full bg-white px-3 py-1.5 text-xs text-brand-700 ring-1 ring-brand-100 hover:bg-brand-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-brand-600 text-white'
                      : m.error
                      ? 'rounded-bl-sm bg-red-50 text-red-700'
                      : 'rounded-bl-sm bg-white text-slate-700'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 animate-pulse-dot rounded-full bg-brand-400"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!status.configured && (
            <div className="bg-amber-50 px-4 py-2 text-xs text-amber-700">
              AI key not configured. Add <code>GEMINI_API_KEY</code> (or another provider) in
              <code> server/.env</code> to enable live replies.
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-slate-100 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Skilly anything..."
              className="input"
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn-primary px-3">
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
