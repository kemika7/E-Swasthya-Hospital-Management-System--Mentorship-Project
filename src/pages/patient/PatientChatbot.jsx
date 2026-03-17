import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSend, FiPlus, FiCalendar, FiRefreshCw, FiCpu,
  FiAlertTriangle, FiInfo, FiCheckCircle
} from 'react-icons/fi';
import { MdOutlineHealthAndSafety } from 'react-icons/md';
import { apiFetch } from '../../services/apiClient';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

const QUICK_REPLIES = [
  { label: '🤒 Fever & Body Ache', text: 'I have fever and body ache' },
  { label: '💔 Chest Pain', text: 'I have chest pain and feel dizzy' },
  { label: '🧠 Headache', text: 'I have a severe headache and nausea' },
  { label: '😮‍💨 Breathing Issues', text: 'I have difficulty breathing and cough' },
  { label: '🤢 Stomach Pain', text: 'I have stomach pain and vomiting' },
  { label: '🦴 Joint Pain', text: 'I have joint pain and swelling' },
  { label: '😰 Anxiety & Stress', text: 'I feel anxious, stressed and cannot sleep' },
  { label: '👁️ Eye Problem', text: 'I have eye pain and blurry vision' },
  { label: '🦷 Tooth Pain', text: 'I have severe toothache and swollen gums' },
  { label: '🧒 Child is Sick', text: 'My child has fever and is not eating' },
];

// Detect severity from AI response text
const getSeverityMeta = (text) => {
  if (text.includes('🔴') || text.includes('HIGH PRIORITY') || text.includes('EMERGENCY')) {
    return { color: '#fee2e2', border: '#fca5a5', icon: <FiAlertTriangle color="#dc2626" size={16} /> };
  }
  if (text.includes('🟡') || text.includes('MODERATE')) {
    return { color: '#fef9c3', border: '#fde047', icon: <FiInfo color="#ca8a04" size={16} /> };
  }
  if (text.includes('🟢') || text.includes('NORMAL')) {
    return { color: '#dcfce7', border: '#86efac', icon: <FiCheckCircle color="#16a34a" size={16} /> };
  }
  return null;
};

// Parse a single inline segment: handles **bold**, *italic*, and [link](url)
const parseInline = (segment, segKey, navigate) => {
  // Doctor links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const boldRegex = /\*\*(.+?)\*\*/g;
  const italicRegex = /\*(.+?)\*/g;

  // Tokenise by splitting on markdown patterns
  const tokens = [];
  let remaining = segment;
  let key = 0;

  // Replace **bold** first
  remaining = remaining.replace(boldRegex, (_, content) => `\x00BOLD:${content}\x00`);
  // Replace *italic* (after bold so ** is already consumed)
  remaining = remaining.replace(italicRegex, (_, content) => `\x00ITALIC:${content}\x00`);
  // Replace [text](url)
  remaining = remaining.replace(linkRegex, (_, label, url) => `\x00LINK:${label}|${url}\x00`);

  const parts = remaining.split('\x00').filter(Boolean);
  for (const part of parts) {
    if (part.startsWith('BOLD:')) {
      tokens.push(<strong key={`${segKey}-b-${key++}`}>{part.slice(5)}</strong>);
    } else if (part.startsWith('ITALIC:')) {
      tokens.push(<em key={`${segKey}-i-${key++}`} style={{ opacity: 0.85 }}>{part.slice(7)}</em>);
    } else if (part.startsWith('LINK:')) {
      const [label, url] = part.slice(5).split('|');
      const isDoctorLink = url.includes('/patient/doctor/');
      tokens.push(
        <span key={`${segKey}-l-${key++}`} style={{ display: 'inline-block', margin: '0.3rem 0' }}>
          <Link
            to={url}
            style={{
              color: 'var(--primary)', textDecoration: 'none', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              backgroundColor: 'rgba(59,130,246,0.08)', padding: '0.4rem 0.85rem',
              borderRadius: '10px', border: '1px solid var(--primary)', fontSize: '0.9rem',
            }}
          >
            {isDoctorLink && <FiPlus size={13} />}
            {label}
          </Link>
        </span>
      );
    } else {
      tokens.push(<span key={`${segKey}-t-${key++}`}>{part}</span>);
    }
  }
  return tokens;
};

const renderMessageContent = (text, navigate) => {
  const hasDocLink = text.includes('/patient/doctor/');
  const lines = text.split('\n');
  const elements = [];
  let listBuffer = [];
  let lineKey = 0;

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${lineKey++}`} style={{ margin: '0.4rem 0 0.4rem 1.1rem', padding: 0 }}>
          {listBuffer.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.25rem', lineHeight: 1.6 }}>
              {parseInline(item, `li-${lineKey}-${idx}`, navigate)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  for (const line of lines) {
    const bulletMatch = line.match(/^[\s]*[-•]\s+(.*)/);
    const tabBulletMatch = line.match(/^\t\+\s+(.*)/);

    if (bulletMatch || tabBulletMatch) {
      listBuffer.push((bulletMatch || tabBulletMatch)[1]);
    } else {
      flushList();
      if (line.trim() === '') {
        elements.push(<br key={`br-${lineKey++}`} />);
      } else {
        elements.push(
          <span key={`ln-${lineKey++}`} style={{ display: 'block', lineHeight: 1.65 }}>
            {parseInline(line, `ln-${lineKey}`, navigate)}
          </span>
        );
      }
    }
  }
  flushList();

  return (
    <div style={{ wordBreak: 'break-word' }}>
      {elements}
      {hasDocLink && (
        <button
          onClick={() => navigate('/patient/appointments')}
          style={{
            marginTop: '0.9rem', padding: '0.6rem 1.1rem', borderRadius: '10px',
            border: 'none', backgroundColor: '#22c55e', color: 'white',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          <FiCalendar size={15} /> Book Appointment
        </button>
      )}
    </div>
  );
};

const INITIAL_MESSAGE = {
  role: 'model',
  content: `Hello! I'm Swasthya AI 👋, your intelligent medical assistant.

I can help you:
- 🔍 Analyze your symptoms
- 🩺 Identify possible conditions
- ⚠️ Assess severity level
- 👨‍⚕️ Recommend the right doctor

**How to use:** Describe your symptoms in your own words — even casual language works! I'll guide you from there.

Swasthya AI provides suggestions only. Always consult a qualified doctor for a definitive diagnosis.`,
};

const PatientChatbot = () => {
  const navigate = useNavigate();
  const { selectedHospital } = useHospital();
  const { userProfile } = useAuth();

  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e, overrideMessage) => {
    if (e) e.preventDefault();
    const userMessage = (overrideMessage || inputVal).trim();
    if (!userMessage) return;

    setInputVal('');
    setShowQuickReplies(false);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await apiFetch('/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          message: userMessage,
          hospitalId: selectedHospital?.id,
          patientId: userProfile?.id,
        }),
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: response.reply || "I'm sorry, I couldn't process that. Please try again.",
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'model', content: 'Connection error. Please check your internet and try again.' },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setShowQuickReplies(true);
    setInputVal('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 0 }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        backgroundColor: 'var(--white)',
        borderRadius: '16px 16px 0 0',
        borderBottom: '1px solid #f1f5f9',
        boxShadow: 'var(--shadow-soft)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary), #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MdOutlineHealthAndSafety size={24} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Swasthya AI
              <span style={{
                width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e',
                boxShadow: '0 0 6px #22c55e', display: 'inline-block',
                animation: 'pulse 2s infinite',
              }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
              AI Medical Assistant · {selectedHospital?.name || 'All Hospitals'}
            </div>
          </div>
        </div>
        <button
          onClick={handleReset}
          title="Start new conversation"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: 10,
            border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
            color: '#64748b', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
          }}
        >
          <FiRefreshCw size={14} /> New Chat
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '1.5rem',
        backgroundColor: '#f8fafc',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
      }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const severityMeta = !isUser ? getSeverityMeta(msg.content) : null;

          return (
            <div key={i} style={{
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end',
              gap: '0.6rem',
            }}>
              {!isUser && (
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--primary), #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FiCpu size={16} color="white" />
                </div>
              )}
              <div style={{
                maxWidth: '75%',
                padding: '0.85rem 1.1rem',
                borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                wordBreak: 'break-word',
                backgroundColor: isUser
                  ? 'var(--primary)'
                  : severityMeta ? severityMeta.color : 'white',
                color: isUser ? 'white' : 'var(--text)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                border: severityMeta ? `1px solid ${severityMeta.border}` : isUser ? 'none' : '1px solid #f1f5f9',
              }}>
                {severityMeta && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.8rem' }}>
                    {severityMeta.icon} Severity detected
                  </div>
                )}
                {isUser
                  ? <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                  : renderMessageContent(msg.content, navigate)
                }
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiCpu size={16} color="white" />
            </div>
            <div style={{
              padding: '0.85rem 1.1rem', borderRadius: '18px 18px 18px 4px',
              backgroundColor: 'white', border: '1px solid #f1f5f9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              display: 'flex', gap: '5px', alignItems: 'center',
            }}>
              {[0, 1, 2].map(n => (
                <span key={n} style={{
                  width: 7, height: 7, borderRadius: '50%', backgroundColor: '#94a3b8',
                  display: 'inline-block',
                  animation: `bounce 1.4s ${n * 0.2}s infinite ease-in-out`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: 'var(--white)',
        borderTop: '1px solid #f1f5f9',
        borderRadius: '0 0 16px 16px',
        padding: '1rem 1.5rem',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
      }}>
        {showQuickReplies && (
          <div style={{
            display: 'flex', gap: '0.5rem', overflowX: 'auto',
            paddingBottom: '0.75rem', scrollbarWidth: 'none',
          }}>
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.text}
                onClick={() => handleSend(null, qr.text)}
                style={{
                  whiteSpace: 'nowrap', padding: '0.45rem 0.9rem',
                  borderRadius: 10, border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc', color: '#475569',
                  fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Describe your symptoms... (e.g. chest pain, dizziness, fever)"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            disabled={isLoading}
            style={{
              flex: 1, padding: '0.85rem 1.1rem',
              border: '1px solid #e2e8f0', borderRadius: 12,
              fontSize: '0.95rem', outline: 'none',
              backgroundColor: '#f8fafc', color: 'var(--text)',
              transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.backgroundColor = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            style={{
              width: 46, height: 46, borderRadius: 12, border: 'none',
              backgroundColor: inputVal.trim() ? 'var(--primary)' : '#e2e8f0',
              color: inputVal.trim() ? 'white' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: inputVal.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <FiSend size={18} />
          </button>
        </form>

        <p style={{ margin: '0.6rem 0 0', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
          ⚕️ Swasthya AI provides suggestions only. Always consult a qualified doctor for medical advice.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default PatientChatbot;
