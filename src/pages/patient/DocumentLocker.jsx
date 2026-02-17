import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDelete, FiFile, FiDownload, FiEye } from 'react-icons/fi';
import { useLocker } from '../../context/LockerContext';

const DocumentLocker = () => {
  const navigate = useNavigate();
  const { isUnlocked, unlockLocker, documents, addDocument, CORRECT_PIN } = useLocker();
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');

  // Auto-validate when PIN reaches 4 digits
  useEffect(() => {
    if (enteredPin.length === 4) {
      if (enteredPin === CORRECT_PIN) {
        unlockLocker();
        setError('');
      } else {
        setError('Incorrect PIN');
        setTimeout(() => {
          setEnteredPin('');
          setError('');
        }, 1000);
      }
    }
  }, [enteredPin, CORRECT_PIN, unlockLocker]);

  const handleDigit = (digit) => {
    if (enteredPin.length >= 4) return;
    setEnteredPin((prev) => prev + digit);
    setError('');
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleUploadClick = () => {
    // Mock file upload - add a new document
    const newDoc = {
      id: documents.length + 1,
      name: `Document_${Date.now()}.pdf`,
      uploadedOn: new Date().toISOString().split('T')[0],
      size: '1.5 MB',
    };
    addDocument(newDoc);
  };

  // STATE 1: LOCKED LOCKER (PIN ENTRY)
  if (!isUnlocked) {
    return (
      <main
        className="layout-main"
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
          paddingBottom: '2rem',
        }}
      >
        {/* TOP HEADER BAR */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--primary)',
            borderRadius: 16,
            padding: '0.9rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/patient/dashboard')}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <FiArrowLeft size={20} style={{ color: 'var(--white)' }} />
          </button>

          <div
            style={{
              flex: 1,
              textAlign: 'center',
              color: 'var(--white)',
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            Locker
          </div>

          <div style={{ width: 40 }} />
        </div>

        {/* PIN INSTRUCTION CARD */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--primary)',
            borderRadius: 16,
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--white)',
              textAlign: 'center',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Please Enter Your PIN to see your Documents
          </p>
        </div>

        {/* PIN DOTS */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: enteredPin.length > index ? 'var(--primary)' : 'rgba(148,163,184,0.3)',
                transition: 'background-color 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--error)',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* NUMERIC KEYPAD */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            maxWidth: 320,
            margin: '0 auto',
          }}
        >
          {/* Rows 1-3: Numbers 1-9 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(String(digit))}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                border: 'none',
                backgroundColor: 'rgba(148,163,184,0.2)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-soft)',
                transition: 'transform 0.1s ease, background-color 0.2s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {digit}
            </button>
          ))}

          {/* Row 4: +*#, 0, Backspace */}
          <button
            type="button"
            style={{
              aspectRatio: '1',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'rgba(148,163,184,0.2)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)',
              transition: 'transform 0.1s ease, background-color 0.2s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            +*#
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            style={{
              aspectRatio: '1',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'rgba(148,163,184,0.2)',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)',
              transition: 'transform 0.1s ease, background-color 0.2s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            style={{
              aspectRatio: '1',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'rgba(148,163,184,0.2)',
              fontSize: '1.25rem',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)',
              transition: 'transform 0.1s ease, background-color 0.2s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FiDelete size={20} />
          </button>
        </div>
      </main>
    );
  }

  // STATE 2: UNLOCKED LOCKER (DOCUMENT VIEW)
  return (
    <main
      className="layout-main"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        paddingBottom: '2rem',
      }}
    >
      {/* TOP HEADER BAR */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--primary)',
          borderRadius: 16,
          padding: '0.9rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/patient/dashboard')}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <FiArrowLeft size={20} style={{ color: 'var(--white)' }} />
        </button>

        <div
          style={{
            flex: 1,
            textAlign: 'center',
            color: 'var(--white)',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          Locker
        </div>

        <div style={{ width: 40 }} />
      </div>

      {/* UPLOAD SECTION */}
      <section
        style={{
          width: '100%',
          backgroundColor: 'rgba(148,163,184,0.15)',
          borderRadius: 16,
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text)',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          Upload Your Files Here
        </h2>
        <div
          onClick={handleUploadClick}
          style={{
            width: '100%',
            minHeight: 120,
            border: '2px dashed rgba(148,163,184,0.4)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            backgroundColor: 'rgba(255,255,255,0.5)',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
            e.currentTarget.style.borderColor = 'rgba(148,163,184,0.4)';
          }}
        >
          <FiFile size={32} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
            Click to upload files
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>
            Supports multiple file uploads
          </span>
        </div>
      </section>

      {/* DOCUMENT LIST SECTION */}
      <section>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '1rem',
          }}
        >
          Your Documents
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                backgroundColor: 'var(--white)',
                borderRadius: 12,
                padding: '1rem',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              {/* File Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: 'rgba(82,178,191,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FiFile size={24} style={{ color: 'var(--primary)' }} />
              </div>

              {/* File Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {doc.name}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text)',
                    opacity: 0.7,
                  }}
                >
                  Uploaded on {doc.uploadedOn} • {doc.size}
                </div>
              </div>

              {/* Action Icons */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'rgba(82,178,191,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(82,178,191,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(82,178,191,0.1)';
                  }}
                >
                  <FiEye size={18} style={{ color: 'var(--primary)' }} />
                </button>
                <button
                  type="button"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'rgba(82,178,191,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(82,178,191,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(82,178,191,0.1)';
                  }}
                >
                  <FiDownload size={18} style={{ color: 'var(--primary)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default DocumentLocker;
