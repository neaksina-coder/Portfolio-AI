import React, { useEffect, useRef, useState } from 'react';

const SUGGESTIONS = [
  'Tell me about yourself',
  'Why should we hire you?',
  'What are your strengths?',
  'What projects have you built?',
  'What is your work experience?',
  'How do you handle teamwork?',
  'What AI tools do you use?',
  'How can I contact you?'
];

function BotIcon({ size = 20 }) {
  return (
    <svg
      className="bot-icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v3" />
      <path d="M8 3h8" />
      <rect x="4" y="7" width="16" height="12" rx="4" />
      <path d="M8.5 12h.01" />
      <path d="M15.5 12h.01" />
      <path d="M9 15h6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function splitAssistantAnswer(text) {
  const normalized = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\s+(One of my notable projects is)/g, '\n\n$1')
    .replace(/\s+(Another project that I worked on was)/g, '\n\n$1')
    .replace(/\s+(I also worked on a project called)/g, '\n\n$1')
    .replace(/\s+(Lastly, I have also worked on)/g, '\n\n$1')
    .replace(/\s+(These projects showcase)/g, '\n\n$1');

  const lines = normalized.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const bulletStart = lines.findIndex(line => /^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line));

  if (bulletStart >= 0) {
    const intro = lines.slice(0, bulletStart).join(' ');
    const items = [];

    lines.slice(bulletStart).forEach(line => {
      const cleaned = line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim();
      if (!cleaned) return;

      if (/^[A-Za-z0-9 .+/&-]{2,40}:/.test(cleaned) || !items.length) {
        items.push(cleaned);
      } else {
        items[items.length - 1] += ` ${cleaned}`;
      }
    });

    return [intro, ...items].filter(Boolean);
  }

  return normalized
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean);
}

function MessageContent({ text, isAssistant }) {
  if (!isAssistant) return <span>{text}</span>;

  const blocks = splitAssistantAnswer(text);
  if (blocks.length <= 1) return <span>{text}</span>;

  return (
    <div className="answer-content">
      <p>{blocks[0]}</p>
      <ul>
        {blocks.slice(1).map((block, index) => (
          <li key={`${index}-${block.slice(0, 20)}`}>
            <span className="answer-icon"><BotIcon size={16} /></span>
            <span>{block}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Message({ m }) {
  const isAssistant = m.role === 'assistant';

  return (
    <div className={`msg ${m.role}`}>
      <div className="avatar">{isAssistant ? <BotIcon /> : 'You'}</div>
      <div className="bubble">
        <MessageContent text={m.text} isAssistant={isAssistant} />
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState('');
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading]);

  async function send(overrideText) {
    const userText = (overrideText ?? q).trim();
    if (!userText || loading) return;

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
          answer += '\n\nSources\n';
          sources.slice(0, 3).forEach((src, i) => {
            const name = src.document_name || src.dataset_name || 'knowledge source';
            const score = typeof src.score === 'number' ? ` - ${(src.score * 100).toFixed(0)}%` : '';
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
      <div className="chat-header">
        <div className="header-left">
          <div className="header-avatar"><BotIcon size={22} /></div>
          <div className="header-info">
            <strong>Sina Neak AI</strong>
            <span>Portfolio Knowledge Base</span>
          </div>
        </div>
        <div className="online-badge">
          <i className="dot" />
          Online
        </div>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><BotIcon size={30} /></div>
            <strong>Ask me anything</strong>
            <span>I can answer HR-style questions about Sina's experience, skills, projects, teamwork, and contact details.</span>
          </div>
        )}

        {messages.map(m => <Message key={m.id} m={m} />)}

        {loading && (
          <div className="msg assistant">
            <div className="avatar"><BotIcon size={20} /></div>
            <div className="bubble typing">
              <i /><i /><i />
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <div className="suggestions persistent">
          {SUGGESTIONS.map(s => (
            <button key={s} className="suggestion-chip" onClick={() => send(s)} disabled={loading}>
              {s}
            </button>
          ))}
        </div>
        <textarea
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Ask about Sina's skills, experience, or projects..."
        />
        <div className="input-row">
          <span className="hint">Enter to send. Shift+Enter for new line</span>
          <button onClick={() => send()} disabled={loading || !q.trim()}>
            {loading ? (
              <span className="btn-loading"><i /><i /><i /></span>
            ) : (
              <>Send <SendIcon /></>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-card {
          max-width: 860px;
          border: 1px solid #e6e9ee;
          border-radius: 14px;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 16px rgba(11, 92, 255, 0.08);
          backdrop-filter: blur(16px);
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 22px;
          background: #f7f8fb;
          border-bottom: 1px solid #e6e9ee;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .header-avatar,
        .empty-icon {
          display: grid;
          place-items: center;
          background: #00e5c0;
          color: #061014;
          box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.16);
        }

        .header-avatar {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          flex: 0 0 42px;
        }

        .header-info {
          display: grid;
          gap: 2px;
        }

        .header-info strong {
          color: #0b1b3a;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.2;
        }

        .header-info span {
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
        }

        .online-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(11, 92, 255, 0.1);
          color: #0b5cff;
          font-size: 12px;
          font-weight: 800;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #0b5cff;
          box-shadow: 0 0 10px rgba(11, 92, 255, 0.5);
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        .chat-body {
          min-height: 360px;
          max-height: 460px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          background: linear-gradient(180deg, #fafbff 0%, #f7f8fb 100%);
          scrollbar-width: thin;
          scrollbar-color: rgba(11, 92, 255, 0.2) transparent;
        }

        .chat-body :global(*) {
          color: inherit;
        }

        .empty-state {
          flex: 1;
          display: grid;
          place-items: center;
          gap: 12px;
          padding: 24px;
          text-align: center;
        }

        .empty-icon {
          width: 58px;
          height: 58px;
          border-radius: 14px;
        }

        .empty-icon .bot-icon {
          width: 30px;
          height: 30px;
        }

        .empty-state strong {
          color: #0b1b3a;
          font-size: 22px;
          font-weight: 900;
        }

        .empty-state span {
          max-width: 460px;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.7;
        }

        .suggestions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 8px;
          margin-top: 6px;
        }

        .suggestions.persistent {
          margin: 0;
          padding-bottom: 2px;
        }

        .suggestion-chip {
          padding: 7px 12px;
          border: 1px solid rgba(11, 92, 255, 0.2);
          border-radius: 999px;
          background: rgba(11, 92, 255, 0.08);
          color: #0b5cff;
          box-shadow: none;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          transition: transform 0.18s, background 0.18s, border-color 0.18s;
        }

        .suggestion-chip:hover:not([disabled]) {
          background: rgba(11, 92, 255, 0.16);
          border-color: rgba(11, 92, 255, 0.4);
          transform: translateY(-1px);
        }

        .msg {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          animation: msg-in 0.22s ease both;
        }

        @keyframes msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }

        .msg.user {
          justify-content: flex-end;
        }

        .msg.user .avatar {
          order: 2;
          background: #0b5cff;
          color: #ffffff;
        }

        .avatar {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #f0f4ff;
          color: #0b5cff;
          box-shadow: none;
          font-size: 11px;
          font-weight: 900;
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
          max-width: min(680px, 78%);
          padding: 13px 16px;
          border: 1px solid #e6e9ee;
          border-radius: 12px;
          background: #ffffff;
          color: #0b1b3a;
          box-shadow: 0 2px 8px rgba(11, 92, 255, 0.05);
          font-size: 14px;
          line-height: 1.72;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .msg.assistant .bubble {
          color: #0b1b3a;
          background: #fafbff;
          border-color: #f0f4ff;
        }

        .msg.user .bubble {
          background: #0b5cff;
          color: #ffffff;
          border-color: #0a47cc;
        }

        .answer-content {
          display: grid;
          gap: 14px;
          white-space: normal;
          color: #0b1b3a;
        }

        .answer-content p {
          margin: 0;
        }

        .answer-content ul {
          display: grid;
          gap: 10px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .answer-content li {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          padding: 10px;
          border: 1px solid #e6e9ee;
          border-radius: 10px;
          background: #fafbff;
          color: #0b1b3a;
        }

        .answer-icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(11, 92, 255, 0.1);
          color: #0b5cff;
        }

        .answer-icon .bot-icon {
          width: 16px;
          height: 16px;
        }

        .typing {
          min-width: 52px;
          min-height: 40px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .typing i,
        .btn-loading i {
          border-radius: 50%;
          animation: bounce 1.1s infinite ease-in-out;
          font-style: normal;
        }

        .typing i {
          width: 6px;
          height: 6px;
          background: #0b5cff;
        }

        .typing i:nth-child(2),
        .btn-loading i:nth-child(2) {
          animation-delay: 0.16s;
        }

        .typing i:nth-child(3),
        .btn-loading i:nth-child(3) {
          animation-delay: 0.32s;
        }

        @keyframes bounce {
          0%, 80%, 100% { opacity: 0.32; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-4px); }
        }

        .chat-input {
          display: grid;
          gap: 10px;
          padding: 16px 18px 18px;
          border-top: 1px solid #e6e9ee;
          background: white;
        }

        .chat-input textarea {
          width: 100%;
          min-height: 56px;
          padding: 13px 16px;
          border: 1px solid #e6e9ee;
          border-radius: 10px;
          outline: none;
          resize: none;
          background: #fafbff;
          color: #0b1b3a;
          font: inherit;
          font-size: 14px;
          line-height: 1.6;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .chat-input textarea:focus {
          border-color: #0b5cff;
          box-shadow: 0 0 0 3px rgba(11, 92, 255, 0.08);
        }

        .chat-input textarea::placeholder {
          color: #9ca3af;
        }

        .input-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .hint {
          color: #9ca3af;
          font-size: 12px;
        }

        .input-row button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-width: 92px;
          justify-content: center;
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          background: #0b5cff;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          transition: transform 0.18s, background 0.18s, box-shadow 0.18s;
        }

        .input-row button:hover:not([disabled]) {
          background: #0a47cc;
          box-shadow: 0 10px 22px rgba(11, 92, 255, 0.2);
          transform: translateY(-1px);
        }

        .input-row button[disabled] {
          cursor: default;
          opacity: 0.45;
        }

        .btn-loading {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-loading i {
          width: 5px;
          height: 5px;
          background: #ffffff;
        }

        @media (max-width: 640px) {
          .chat-header {
            padding: 16px;
          }

          .online-badge {
            display: none;
          }

          .chat-body {
            min-height: 320px;
            padding: 16px;
          }

          .bubble {
            max-width: calc(100% - 44px);
          }

          .hint {
            display: none;
          }

          .input-row {
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
