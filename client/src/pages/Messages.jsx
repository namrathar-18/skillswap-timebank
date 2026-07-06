import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { Avatar, EmptyState } from '../components/ui.jsx';

export default function Messages() {
  const { user } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const loadConversations = useCallback(async () => {
    const { data } = await api.get('/messages');
    setConversations(data.conversations);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load the active thread.
  useEffect(() => {
    if (!userId) {
      setMessages([]);
      setPartner(null);
      return;
    }
    api.get(`/messages/${userId}`).then(({ data }) => setMessages(data.messages));
    api.get(`/users/${userId}`).then(({ data }) => setPartner(data.user)).catch(() => {});
  }, [userId]);

  // Live updates.
  useSocket(
    useCallback(
      (msg) => {
        const senderId = msg.sender?._id || msg.sender;
        if (String(senderId) === String(userId)) {
          setMessages((m) => [...m, msg]);
        }
        loadConversations();
      },
      [userId, loadConversations]
    )
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await api.post('/messages', { recipientId: userId, body: text });
      setMessages((m) => [...m, { ...data.message, sender: { _id: user._id, name: user.name } }]);
      setText('');
      loadConversations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Messages</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Conversation list */}
        <div className="card space-y-1 md:col-span-1">
          {conversations.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No conversations yet.</p>
          ) : (
            conversations.map((c) => {
              const other = String(c.sender._id) === String(user._id) ? c.recipient : c.sender;
              return (
                <button
                  key={c.thread}
                  onClick={() => navigate(`/messages/${other._id}`)}
                  className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-50 ${
                    String(other._id) === String(userId) ? 'bg-brand-50' : ''
                  }`}
                >
                  <Avatar name={other.name} src={other.avatar} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">{other.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.body}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Active thread */}
        <div className="card flex h-[28rem] flex-col md:col-span-2">
          {!userId ? (
            <EmptyState icon="💬" title="Select a conversation" subtitle="Pick someone from the list to start chatting." />
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Avatar name={partner?.name} src={partner?.avatar} size={36} />
                <p className="font-semibold text-slate-800">{partner?.name || 'Conversation'}</p>
              </div>

              <div ref={scrollRef} className="scroll-thin flex-1 space-y-2 overflow-y-auto py-3">
                {messages.map((m) => {
                  const mine = String(m.sender?._id || m.sender) === String(user._id);
                  return (
                    <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                          mine ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={send} className="flex gap-2 border-t border-slate-100 pt-3">
                <input
                  className="input"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="btn-primary">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
