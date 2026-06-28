import React, { useState, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';

const { TextArea } = Input;

const AskTimLogo = ({ size = 28 }) => (
  <img src="/asktim-logo.svg" alt="AskTim" width={size} height={size}
    style={{ display: 'block', borderRadius: '50%', flexShrink: 0 }} />
);

const TypingDots = () => (
  <div style={{ display: 'flex', gap: 4, padding: '4px 0', alignItems: 'center' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'rgba(99,102,241,0.6)',
        display: 'inline-block',
        animation: 'ai-bounce 1.2s infinite',
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
  </div>
);

// Splits text into parts, wrapping URLs in <a> tags
const renderWithLinks = (text, isDark) => {
  const urlRegex = /(https?:\/\/\S+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (!urlRegex.test(part)) return part;
    // Strip trailing punctuation that isn't part of the URL
    const clean = part.replace(/[.,)>\]'"!?]+$/, '');
    const trailing = part.slice(clean.length);
    return (
      <React.Fragment key={i}>
        <a
          href={clean}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: isDark ? '#93c5fd' : '#4f46e5',
            textDecoration: 'underline',
            wordBreak: 'break-all',
          }}
        >
          {clean}
        </a>
        {trailing}
      </React.Fragment>
    );
  });
};

const Message = ({ msg, isDark }) => {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      gap: 8,
      alignItems: 'flex-end',
    }}>
      {!isUser && <AskTimLogo size={28} />}
      <div style={{
        maxWidth: '78%',
        padding: '9px 13px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser
          ? 'linear-gradient(135deg,#6366f1,#06b6d4)'
          : isDark ? 'rgba(255,255,255,0.07)' : '#f0f1ff',
        color: isUser ? '#fff' : isDark ? 'rgba(255,255,255,0.88)' : '#1e1b4b',
        fontSize: '0.875rem',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        border: isUser
          ? 'none'
          : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(99,102,241,0.2)',
      }}>
        {isUser ? msg.content : renderWithLinks(msg.content, isDark)}
      </div>
      {isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <UserOutlined style={{ color: '#fff', fontSize: 13 }} />
        </div>
      )}
    </div>
  );
};

const GREETING = "Hi! I'm AskTim — your AI guide to this portfolio. Ask me anything about Tim's skills, projects, experience, or how to get in touch!";

const STORAGE_KEY = 'asktim_chat_history';

const loadHistory = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* ignore */ }
  return [{ role: 'assistant', content: GREETING }];
};

const AIChatWidget = () => {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [open, messages]);

  const send = async (override) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    // Add an empty assistant placeholder to stream tokens into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || '') + '/ai/chat';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });

      if (!response.ok) throw new Error('Network error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setLoading(false); // dots disappear, streaming begins

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') {
            if (!open) setUnread(u => u + 1);
            return;
          }
          try {
            const { token, error } = JSON.parse(payload);
            if (error) throw new Error(error);
            if (token) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + token,
                };
                return updated;
              });
            }
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch {
      setLoading(false);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
        return updated;
      });
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const SUGGESTIONS = ['What are your top skills?', 'Tell me about your projects', 'How can I contact you?'];

  /* ── theme tokens ── */
  const t = isDark ? {
    window:   'rgba(15,15,30,0.97)',
    border:   'rgba(99,102,241,0.3)',
    shadow:   '0 20px 60px rgba(0,0,0,0.55)',
    msgArea:  'transparent',
    divider:  'rgba(255,255,255,0.08)',
    inputBg:  'rgba(255,255,255,0.07)',
    inputBdr: 'rgba(255,255,255,0.12)',
    inputClr: '#fff',
    inputPh:  'rgba(255,255,255,0.35)',
    chipBg:   'rgba(99,102,241,0.15)',
    chipBdr:  'rgba(99,102,241,0.35)',
    chipClr:  '#a5b4fc',
    tooltipBg:'rgba(15,15,30,0.92)',
    tooltipC: '#fff',
  } : {
    window:   'rgba(255,255,255,0.98)',
    border:   'rgba(99,102,241,0.25)',
    shadow:   '0 20px 60px rgba(99,102,241,0.18)',
    msgArea:  'transparent',
    divider:  'rgba(99,102,241,0.12)',
    inputBg:  '#f8f8ff',
    inputBdr: 'rgba(99,102,241,0.25)',
    inputClr: '#1e1b4b',
    inputPh:  'rgba(99,102,241,0.4)',
    chipBg:   'rgba(99,102,241,0.08)',
    chipBdr:  'rgba(99,102,241,0.3)',
    chipClr:  '#6366f1',
    tooltipBg:'rgba(255,255,255,0.97)',
    tooltipC: '#1e1b4b',
  };

  return (
    <>
      <style>{`
        @keyframes ai-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes ai-pop-in {
          from { opacity: 0; transform: scale(0.85) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ai-chat-window { animation: ai-pop-in 0.22s ease; }
        .ai-fab:hover { transform: scale(1.08); }
        .ai-fab { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .ai-fab-tooltip {
          position: absolute; right: 64px; bottom: 50%;
          transform: translateY(50%);
          padding: 5px 10px; border-radius: 8px;
          font-size: 0.78rem; font-weight: 600; white-space: nowrap;
          border: 1px solid rgba(99,102,241,0.35);
          pointer-events: none;
          opacity: 0; transition: opacity 0.15s ease;
        }
        .ai-fab:hover .ai-fab-tooltip { opacity: 1; }
        .ai-fab-tooltip::after {
          content: ''; position: absolute; right: -5px; top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right: none;
          border-left-color: rgba(99,102,241,0.35);
        }
        .ai-msg-area::-webkit-scrollbar { width: 4px; }
        .ai-msg-area::-webkit-scrollbar-track { background: transparent; }
        .ai-msg-area::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>

      {/* ── Chat window ── */}
      {open && (
        <div className="ai-chat-window" style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 1000,
          width: 340, height: 480,
          background: t.window,
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header — always gradient, works in both modes */}
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AskTimLogo size={36} />
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>AskTim</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem' }}>AI-powered portfolio guide</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {messages.length > 1 && (
                <Button type="text"
                  onClick={() => { setMessages([{ role: 'assistant', content: GREETING }]); localStorage.removeItem(STORAGE_KEY); }}
                  title="Clear chat"
                  style={{ color: 'rgba(255,255,255,0.7)', padding: '0 6px', fontSize: '0.75rem' }}
                >
                  Clear
                </Button>
              )}
              <Button type="text" icon={<CloseOutlined />}
                onClick={() => setOpen(false)}
                style={{ color: '#fff', padding: '0 6px' }} />
            </div>
          </div>

          {/* Messages */}
          <div className="ai-msg-area" style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', background: t.msgArea }}>
            {messages.map((m, i) => <Message key={i} msg={m} isDark={isDark} />)}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 12 }}>
                <AskTimLogo size={28} />
                <div style={{
                  padding: '9px 13px', borderRadius: '16px 16px 16px 4px',
                  background: isDark ? 'rgba(255,255,255,0.07)' : '#f0f1ff',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(99,102,241,0.2)',
                }}>
                  <TypingDots />
                </div>
              </div>
            )}
            {messages.length === 1 && !loading && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(99,102,241,0.5)', marginBottom: 7, paddingLeft: 4 }}>
                  Try asking…
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => { setInput(''); send(s); }}
                      style={{
                        background: t.chipBg, border: `1px solid ${t.chipBdr}`,
                        borderRadius: 12, padding: '7px 12px', color: t.chipClr,
                        fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s', width: '100%',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.28)' : 'rgba(99,102,241,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = t.chipBg; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: `1px solid ${t.divider}`,
            display: 'flex', gap: 8, alignItems: 'flex-end',
            background: t.window,
          }}>
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about skills, projects..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              disabled={loading}
              style={{
                flex: 1,
                background: t.inputBg,
                border: `1px solid ${t.inputBdr}`,
                borderRadius: 12,
                color: t.inputClr,
                resize: 'none',
                fontSize: '0.875rem',
              }}
            />
            <Button
              type="primary" shape="circle" icon={<SendOutlined />}
              onClick={send} loading={loading} disabled={!input.trim()}
              style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', border: 'none', flexShrink: 0 }}
            />
          </div>
        </div>
      )}

      {/* ── FAB button ── */}
      <button className="ai-fab" onClick={() => setOpen(v => !v)} style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 1001,
        width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: open ? 'linear-gradient(135deg,#6366f1,#06b6d4)' : 'transparent',
        padding: 0,
        boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {!open && (
          <span className="ai-fab-tooltip" style={{ background: t.tooltipBg, color: t.tooltipC }}>
            AskTim
          </span>
        )}
        {open
          ? <CloseOutlined style={{ color: '#fff', fontSize: 20 }} />
          : <img src="/asktim-logo.svg" alt="AskTim" width={56} height={56} style={{ borderRadius: '50%', display: 'block' }} />
        }
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</span>
        )}
      </button>
    </>
  );
};

export default AIChatWidget;
