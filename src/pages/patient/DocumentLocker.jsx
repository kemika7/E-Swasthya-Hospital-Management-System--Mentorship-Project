import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDelete, FiFile, FiDownload, FiEye, FiTrash2, FiLoader } from 'react-icons/fi';
import { useLocker } from '../../context/LockerContext';

const DocumentLocker = () => {
  const navigate = useNavigate();
  const { isUnlocked, hasSetPin, checkStatus, setupPin, verifyPin, documents, addDocument, deleteDocument } = useLocker();
  const [enteredPin, setEnteredPin] = useState('');
  const [setupStep, setSetupStep] = useState('enter'); // 'enter' | 'confirm'
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Loading state when checking if pin exists
  if (hasSetPin === null) {
    return (
      <main className="layout-main" style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiLoader className="spin" size={32} style={{ color: 'var(--primary)' }} />
      </main>
    );
  }

  const handleDigit = (digit) => {
    if (enteredPin.length >= 6) return;
    setEnteredPin((prev) => prev + digit);
    setError('');
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleSubmitPin = async () => {
    if (enteredPin.length < 4 || enteredPin.length > 6) {
      setError('PIN must be 4 to 6 digits');
      return;
    }

    if (!hasSetPin) {
      // Setup Flow
      if (setupStep === 'enter') {
        setFirstPin(enteredPin);
        setEnteredPin('');
        setSetupStep('confirm');
      } else {
        if (enteredPin === firstPin) {
          setLoading(true);
          try {
            await setupPin(enteredPin);
            setError('');
          } catch (err) {
            setError('Failed to setup PIN');
          } finally {
            setLoading(false);
          }
        } else {
          setError('PINs do not match. Try again.');
          setFirstPin('');
          setEnteredPin('');
          setSetupStep('enter');
        }
      }
    } else {
      // Unlock Flow
      setLoading(true);
      try {
        await verifyPin(enteredPin);
        setError('');
      } catch (err) {
        setError('Incorrect PIN');
        setEnteredPin('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const extension = file.name.split('.').pop().toLowerCase();
    const isAllowedExtension = ['pdf', 'jpg', 'jpeg', 'png'].includes(extension);

    if (!allowedTypes.includes(file.type) && !isAllowedExtension) {
      alert('Only PDF, JPG, and PNG files are allowed.');
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }

    try {
      setLoading(true);
      await addDocument(file);
      alert('Document uploaded successfully!');
    } catch (err) {
      alert('Failed to upload document');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = (doc) => {
    // In a real app we might fetch as blob and trigger download
    window.open(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${doc.file_path}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        setLoading(true);
        await deleteDocument(id);
      } catch (err) {
        alert('Failed to delete document');
      } finally {
        setLoading(false);
      }
    }
  };

  // STATE 1: LOCKED LOCKER / SETUP MPIN
  if (!isUnlocked) {
    const instructionText = !hasSetPin 
      ? (setupStep === 'enter' ? 'Create a 4-6 digit MPIN' : 'Confirm your MPIN')
      : 'Please Enter Your MPIN to unlock';

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
            Document Locker
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
            {instructionText}
          </p>
        </div>

        {/* PIN DOTS (Variable based on entered length, max 6) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            minHeight: '16px'
          }}
        >
          {Array.from({ length: Math.max(4, enteredPin.length) }).map((_, index) => (
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
              disabled={loading}
              onClick={() => handleDigit(String(digit))}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                border: 'none',
                backgroundColor: 'rgba(148,163,184,0.2)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-soft)',
                transition: 'transform 0.1s ease, background-color 0.2s ease',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {digit}
            </button>
          ))}

          {/* Row 4: Cancel/Clear, 0, Backspace */}
          <button
            type="button"
            disabled={loading}
            onClick={() => { setEnteredPin(''); setError(''); }}
            style={{
              aspectRatio: '1',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'rgba(148,163,184,0.2)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)',
              transition: 'transform 0.1s ease, background-color 0.2s ease',
            }}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            Clear
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDigit('0')}
            style={{
              aspectRatio: '1',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'rgba(148,163,184,0.2)',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)',
              transition: 'transform 0.1s ease, background-color 0.2s ease',
            }}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            0
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleBackspace}
            style={{
              aspectRatio: '1',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'rgba(148,163,184,0.2)',
              fontSize: '1.25rem',
              color: 'var(--text)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-soft)',
              transition: 'transform 0.1s ease, background-color 0.2s ease',
            }}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FiDelete size={20} />
          </button>
        </div>

        {/* Submit Button */}
        <div style={{ maxWidth: 320, margin: '1.5rem auto 0' }}>
           <button
             onClick={handleSubmitPin}
             disabled={loading || enteredPin.length < 4}
             style={{
               width: '100%',
               padding: '1rem',
               borderRadius: 12,
               border: 'none',
               backgroundColor: enteredPin.length >= 4 ? 'var(--primary)' : 'rgba(148,163,184,0.3)',
               color: enteredPin.length >= 4 ? 'var(--white)' : 'rgba(23,23,16,0.5)',
               fontSize: '1rem',
               fontWeight: 600,
               cursor: enteredPin.length >= 4 ? 'pointer' : 'not-allowed',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               transition: 'all 0.2s ease',
             }}
           >
             {loading ? <FiLoader className="spin" /> : 'Enter'}
           </button>
        </div>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .spin {
              animation: spin 1s linear infinite;
            }
          `}
        </style>
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
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        />
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
            cursor: loading ? 'wait' : 'pointer',
            backgroundColor: 'rgba(255,255,255,0.5)',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.borderColor = 'rgba(148,163,184,0.4)';
            }
          }}
        >
          {loading ? (
            <FiLoader className="spin" size={32} style={{ color: 'var(--primary)' }} />
          ) : (
            <>
              <FiFile size={32} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
                Click to upload files
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>
                Supports PDF, JPG, PNG (Max 10MB)
              </span>
            </>
          )}
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
        
        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(148,163,184,0.8)' }}>
            No documents uploaded yet.
          </div>
        ) : (
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
                    title={doc.name}
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
                    onClick={() => handleDownload(doc)}
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
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(82,178,191,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(82,178,191,0.1)'}
                    title="View / Download"
                  >
                    <FiDownload size={18} style={{ color: 'var(--primary)' }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    title="Delete Document"
                  >
                    <FiTrash2 size={18} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </main>
  );
};

export default DocumentLocker;
