import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiPlus, FiCalendar } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import '../styles/SwasthyaAI.css';

const QUICK_REPLIES = [
  "I have a fever",
  "I have chest pain",
  "I have a headache",
  "I need a skin doctor",
  "My child is sick",
  "I feel anxious and stressed",
  "I have difficulty breathing",
  "I have stomach pain",
];

const SwasthyaAI = () => {
  const navigate = useNavigate();
  const { selectedHospital } = useHospital();
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      content: "Hello! I am Swasthya AI, your health assistant. I can help you understand symptoms, provide basic health guidance, and suggest doctors from our hospital network. How can I help you today?" 
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const parseInlineMini = (segment, segKey, isModel) => {
    let remaining = segment;
    remaining = remaining.replace(/\*\*(.+?)\*\*/g, (_, c) => `\x00BOLD:${c}\x00`);
    remaining = remaining.replace(/\*(.+?)\*/g, (_, c) => `\x00ITALIC:${c}\x00`);
    remaining = remaining.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => `\x00LINK:${label}|${url}\x00`);
    const parts = remaining.split('\x00').filter(Boolean);
    return parts.map((part, i) => {
      if (part.startsWith('BOLD:')) return <strong key={`${segKey}-b${i}`}>{part.slice(5)}</strong>;
      if (part.startsWith('ITALIC:')) return <em key={`${segKey}-i${i}`} style={{ opacity: 0.85 }}>{part.slice(7)}</em>;
      if (part.startsWith('LINK:')) {
        const [label, url] = part.slice(5).split('|');
        const isDoctorLink = url.includes('/patient/doctor/');
        return (
          <span key={`${segKey}-l${i}`} style={{ display: 'inline-block', margin: '0.25rem 0' }}>
            <Link to={url} style={{
              color: isModel ? 'var(--primary)' : 'white', textDecoration: 'none', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              backgroundColor: isModel ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.2)',
              padding: '0.35rem 0.75rem', borderRadius: '8px',
              border: isModel ? '1px solid var(--primary)' : '1px solid white', fontSize: '0.88rem',
            }}>
              {isDoctorLink && <FiPlus size={13} />}{label}
            </Link>
          </span>
        );
      }
      return <span key={`${segKey}-t${i}`}>{part}</span>;
    });
  };

  const renderMessageContent = (text, isModel) => {
    const lines = text.split('\n');
    const elements = [];
    let listBuffer = [];
    let lk = 0;

    const flushList = () => {
      if (listBuffer.length === 0) return;
      elements.push(
        <ul key={`ul-${lk++}`} style={{ margin: '0.3rem 0 0.3rem 1rem', padding: 0 }}>
          {listBuffer.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.2rem', lineHeight: 1.55 }}>
              {parseInlineMini(item, `li-${lk}-${idx}`, isModel)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    };

    for (const line of lines) {
      const bullet = line.match(/^[\s]*[-•]\s+(.*)/);
      if (bullet) {
        listBuffer.push(bullet[1]);
      } else {
        flushList();
        if (line.trim() === '') {
          elements.push(<br key={`br-${lk++}`} />);
        } else {
          elements.push(
            <span key={`ln-${lk++}`} style={{ display: 'block', lineHeight: 1.55 }}>
              {parseInlineMini(line, `ln-${lk}`, isModel)}
            </span>
          );
        }
      }
    }
    flushList();

    return (
      <div style={{ wordBreak: 'break-word' }}>
        {elements}
        {isModel && text.includes('/patient/doctor/') && (
          <button
            onClick={() => navigate('/patient/appointments')}
            style={{
              marginTop: '0.8rem', padding: '0.6rem 1rem', borderRadius: '8px',
              border: 'none', backgroundColor: '#22c55e', color: 'white',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content',
            }}
          >
            <FiCalendar size={16} /> Book Appointment
          </button>
        )}
      </div>
    );
  };

  const handleSend = async (e, overrideMessage) => {
    if (e) e.preventDefault();
    const userMessage = overrideMessage || inputVal;
    if (!userMessage.trim()) return;

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
          patientId: userProfile?.id
        })
      });

      if (response.reply) {
        setMessages(prev => [...prev, { role: 'model', content: response.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I'm having trouble responding right now. Please try again later." }]);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [...prev, { role: 'model', content: "Connection error. Please check your internet and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="swastha-ai-container">
      {isOpen ? (
        <div className="swastha-ai-window">
          <div className="swastha-ai-header">
            <div className="swastha-ai-title">
              <div className="swastha-ai-status-dot"></div>
              Swasthya AI
            </div>
            <button className="swastha-ai-close" onClick={() => setIsOpen(false)}>
              <FiX size={20} />
            </button>
          </div>

          <div className="swastha-ai-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`swastha-ai-message ${msg.role === 'user' ? 'user' : 'model'}`}>
                <div className="message-bubble">{renderMessageContent(msg.content, msg.role === 'model')}</div>
              </div>
            ))}
            {isLoading && (
              <div className="swastha-ai-message model">
                <div className="message-bubble typing-indicator">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="swastha-ai-footer">
            {showQuickReplies && !isLoading && (
              <div className="swastha-ai-quick-replies">
                {QUICK_REPLIES.map((qr) => (
                  <button key={qr} className="quick-reply-chip" onClick={() => handleSend(null, qr)}>
                    {qr}
                  </button>
                ))}
              </div>
            )}
            <form className="swastha-ai-input-form" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Ask Swasthya AI..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !inputVal.trim()} className="swastha-ai-send-btn">
                <FiSend size={18} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button className="swastha-ai-floating-btn" onClick={() => setIsOpen(true)}>
          <div className="btn-glow"></div>
          <FiMessageSquare size={24} />
          <span className="btn-label">Swasthya AI</span>
        </button>
      )}
    </div>
  );
};

export default SwasthyaAI;
