import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiPlus, FiCalendar } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import { useHospital } from '../context/HospitalContext';
import '../styles/SwasthyaAI.css';

const QUICK_REPLIES = [
  "I have a fever",
  "I have chest pain",
  "I have a headache",
  "I need a skin doctor",
  "My child is sick",
];

const SwasthyaAI = () => {
  const navigate = useNavigate();
  const { selectedHospital } = useHospital();
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

  const renderMessageContent = (text, isModel) => {
    // Parse [text](url) into Link elements
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const isDoctorLink = match[2].includes('/patient/doctor/');
      
      parts.push(
        <div key={match.index} style={{ margin: '0.5rem 0' }}>
            <Link
            to={match[2]}
            style={{
                color: isModel ? 'var(--primary)' : 'white',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: isModel ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.2)',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: isModel ? '1px solid var(--primary)' : '1px solid white'
            }}
            >
            {isDoctorLink && <FiPlus size={14} />}
            {match[1]}
            </Link>
        </div>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
        <div style={{ whiteSpace: 'pre-wrap' }}>
            {parts.length > 0 ? parts : text}
            {isModel && text.includes('/patient/doctor/') && (
                <button 
                    onClick={() => navigate('/patient/appointments')}
                    style={{
                        marginTop: '0.8rem',
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: 'fit-content'
                    }}
                >
                    <FiCalendar size={16} />
                    Book Appointment
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
          hospitalId: selectedHospital?.id
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
