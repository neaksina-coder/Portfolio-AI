import React, { useEffect, useRef, useState } from 'react';

const SUGGESTIONS = [
  'Tell me about yourself',
  'What AI tools do you use?',
  'What projects have you built?',
  'How can I contact you?',
];

function Message({ m }) {
  const isAssistant = m.role === 'assistant';

  return (
    <div className={`msg ${m.role}`}>
      <div className="avatar">
        {isAssistant ? <BotIcon /> : 'You'}
      </div>
      <div className="bubble">{m.text}</div>
    </div>
  );
}

function BotIcon() {
  return (
    <svg className="bot-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v3" />
      <path d="M8 3h8" />
      <rect x="4" y="7" width="16" height="12" rx="4" />
      <path d="M8.5 12h.01" />
      <path d="M15.5 12h.01" />
      <path d="M9 15h6" />
    </svg>
  );
}

export default function ChatWidget() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState('');
  const bodyRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading]);

  async function send(overrideText) {
    const userText = (overrideText ?? q).trim();
    if (!userText) return;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userText }]);
    setQ('');
    setLoading(true);

    try {
      const r = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, conversationId })
      });
      const data = await r.json();
      if (data?.conversation_id) setConversationId(data.conversation_id);

      let answer = '';
      if (!r.ok) {
        answer = data?.error?.message || data?.error || 'The knowledge chat is not configured yet.';
      } else if (data?.answer) {
        answer = data.answer;
        const sources = data.metadata?.retriever_resources || [];
        if (sources.length) {
          answer += '\n\n— Sources\n';
          sources.slice(0, 3).forEach((src, i) => {
            const name = src.document_name || src.dataset_name || 'knowledge source';
            const score = typeof src.score === 'number' ? ` · ${(src.score * 100).toFixed(0)}%` : '';
            answer += `${i + 1}. ${name}${score}\n`;
          });
        }
      } else if (data?.records?.length) {
        const top = data.records[0];
        answer = top.segment?.content || top.segment?.answer || 'Found matching content.';
      } else {
        answer = 'No relevant information found. Try rephrasing your question.';
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: answer }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', text: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-card">

      {/* ── HEADER ── */}
      <div className="chat-header">
        <div className="header-left">
          <div className="header-avatar">SN</div>
          <div className="header-info">
            <strong>Sina Neak · AI</strong>
            <span>Portfolio Knowledge Base</span>
          </div>
        </div>
        <div className="online-badge">
          <i className="dot" />
          Online
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="chat-body" ref={bodyRef}>
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <strong>Ask me anything</strong>
            <span>I can answer questions about Sina's experience, skills, projects, and more.</span>
            <div className="suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="suggestion-chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(m => <Message key={m.id} m={m} />)}
        {loading && (
          <div className="msg assistant">
            <div className="avatar"><BotIcon /></div>
            <div className="bubble typing">
              <i /><i /><i />
            </div>
          </div>
        )}
      </div>

      {/* ── INPUT ── */}
      <div className="chat-input">
        <textarea
          ref={textareaRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          rows={2}
          placeholder="Ask about Sina's skills, experience, or projects..."
        />
        <div className="input-row">
          <span className="hint">Enter to send · Shift+Enter for new line</span>
          <button onClick={() => send()} disabled={loading || !q.trim()}>
            {loading ? (
              <span className="btn-loading"><i /><i /><i /></span>
            ) : (
              <>Send <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-card {
          max-width: 860px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          background: #0d1219;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        /* header */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          background: #111820;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .header-avatar {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: #00e5c0;
          color: #080c10;
          display: grid; place-items: center;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .header-info { display: grid; gap: 2px; }
        .header-info strong { font-size: 15px; color: #e8edf2; font-weight: 700; font-family: 'Syne', sans-serif; }
        .header-info span { font-size: 12px; color: #6b7a8d; font-weight: 400; }
        .online-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: #00e5c0;
        }
        .dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #00e5c0;
          box-shadow: 0 0 8px #00e5c0;
          animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* body */
        .chat-body {
          padding: 24px 22px;
          min-height: 360px;
          max-height: 460px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }

        /* empty state */
        .empty-state {
          flex: 1;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 24px;
          gap: 10px;
        }
        .empty-icon { font-size: 28px; color: #00e5c0; line-height: 1; }
        .empty-state strong { color: #e8edf2; font-size: 20px; font-family: 'Syne', sans-serif; }
        .empty-state span { color: #6b7a8d; font-size: 14px; max-width: 420px; line-height: 1.7; }
        .suggestions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 6px; }
        .suggestion-chip {
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid rgba(0,229,192,0.22);
          background: rgba(0,229,192,0.06);
          color: #00e5c0;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
        }
        .suggestion-chip:hover {
          background: rgba(0,229,192,0.14);
          border-color: rgba(0,229,192,0.5);
          transform: translateY(-1px);
        }

        /* messages */
        .msg {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          animation: msg-in 0.22s ease both;
        }
        @keyframes msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .msg.user { justify-content: flex-end; }
        .msg.user .avatar { order: 2; background: #3d8bff; color: #fff; }
        .avatar {
          width: 32px; height: 32px; flex-shrink: 0;
          border-radius: 8px;
          display: grid; place-items: center;
          background: rgba(0,229,192,0.12);
          color: #00e5c0;
          font-size: 11px;
          font-weight: 800;
          font-family: 'Syne', sans-serif;
        }
        .bot-icon {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .bubble {
          max-width: min(640px, 76%);
          padding: 12px 16px;
          border-radius: 12px;
          background: #141c26;
          border: 1px solid rgba(255,255,255,0.07);
          color: #c8d4e0;
          font-size: 14px;
          line-height: 1.75;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .msg.user .bubble {
          background: #3d8bff;
          border-color: #3d8bff;
          color: #fff;
        }

        /* typing dots */
        .typing {
          display: flex; align-items: center; gap: 5px;
          min-width: 52px; min-height: 40px;
        }
        .typing i {
          width: 6px; height: 6px; border-radius: 50%;
          background: #00e5c0;
          animation: bounce 1.1s infinite ease-in-out;
          font-style: normal;
        }
        .typing i:nth-child(2) { animation-delay: .16s; }
        .typing i:nth-child(3) { animation-delay: .32s; }
        @keyframes bounce { 0%,80%,100%{opacity:.3;transform:translateY(0)} 40%{opacity:1;transform:translateY(-4px)} }

        /* input */
        .chat-input {
          padding: 16px 22px 20px;
          background: #111820;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: grid;
          gap: 10px;
        }
        .chat-input textarea {
          width: 100%;
          padding: 13px 16px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          background: #0d1219;
          color: #e8edf2;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .chat-input textarea::placeholder { color: #3d4a5c; }
        .chat-input textarea:focus {
          border-color: rgba(0,229,192,0.4);
          box-shadow: 0 0 0 3px rgba(0,229,192,0.08);
        }
        .input-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .hint { font-size: 12px; color: #3d4a5c; }
        .input-row button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: #00e5c0;
          color: #080c10;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .input-row button:hover:not([disabled]) {
          background: #00ffd4;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,229,192,0.3);
        }
        .input-row button[disabled] { opacity: 0.4; cursor: default; }
        .btn-loading {
          display: flex; align-items: center; gap: 4px;
        }
        .btn-loading i {
          width: 5px; height: 5px; border-radius: 50%;
          background: #080c10;
          animation: bounce 1.1s infinite ease-in-out;
          font-style: normal;
        }
        .btn-loading i:nth-child(2) { animation-delay: .16s; }
        .btn-loading i:nth-child(3) { animation-delay: .32s; }

        @media (max-width: 640px) {
          .chat-body { padding: 16px; min-height: 300px; }
          .bubble { max-width: calc(100% - 44px); }
          .hint { display: none; }
        }
      `}</style>
    </div>
  );
}
