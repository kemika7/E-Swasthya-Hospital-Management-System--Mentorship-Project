import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/apiClient';
import '../styles/SwasthaAI.css';

const QUICK_REPLIES = [
  "I have a fever",
  "I have chest pain",
  "I have a headache",
  "I need a skin doctor",
  "My child is sick",
];

const SwasthaAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I'm Swastha AI. Describe your symptoms and I'll suggest the right doctor for you." },
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
    // Remove formatting asterisks
    let cleanText = text.replace(/\*/g, '');

    // Parse [text](url) into Link elements
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(cleanText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanText.substring(lastIndex, match.index));
      }
      parts.push(
        <Link
          to={match[2]}
          key={match.index}
          style={{
            color: isModel ? 'var(--primary)' : 'white',
            textDecoration: 'underline',
            fontWeight: 600
          }}
        >
          {match[1]}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < cleanText.length) {
      parts.push(cleanText.substring(lastIndex));
    }

    return parts.length > 0 ? parts : cleanText;
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: messages,
          message: userMessage
        })
      });

      if (response.reply) {
        setMessages(prev => [...prev, { role: 'model', content: response.reply }]);
      } else if (response.error) {
        setMessages(prev => [...prev, { role: 'model', content: "An error occurred with my system. Let me reboot my connection." }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I couldn't process that request." }]);
      }
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      setMessages(prev => [...prev, { role: 'model', content: "An error occurred while connecting to Swastha AI. Please try again." }]);
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
              <span className="swastha-ai-icon">🤖</span>
              Swastha AI
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
            {showQuickReplies && !isLoading && (
              <div className="swastha-ai-quick-replies">
                {QUICK_REPLIES.map((qr) => (
                  <button key={qr} className="quick-reply-chip" onClick={() => handleSend(null, qr)}>
                    {qr}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="swastha-ai-input-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Describe your symptoms..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputVal.trim()} className="swastha-ai-send-btn">
              <FiSend size={18} />
            </button>
          </form>
        </div>
      ) : (
        <button className="swastha-ai-floating-btn" onClick={() => setIsOpen(true)}>
          <FiMessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default SwasthaAI;
