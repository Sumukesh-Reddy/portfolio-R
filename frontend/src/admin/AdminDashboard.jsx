import React, { useState, useEffect } from 'react';
import { requestAdminOtp, verifyAdminOtp, getAllSessions } from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: otp
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [fetchError, setFetchError] = useState('');

  // Fetch sessions when authenticated
  useEffect(() => {
    if (!token) return;

    const loadSessions = async () => {
      try {
        setFetchError('');
        const data = await getAllSessions(token);
        setSessions(data.sessions || []);
      } catch (err) {
        if (err.response?.status === 401) {
          handleLogout();
        } else {
          setFetchError('Failed to fetch sessions.');
        }
      }
    };

    loadSessions();
  }, [token]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setAuthError('');
    try {
      await requestAdminOtp(email);
      setStep(2);
    } catch (err) {
      setAuthError('Failed to request OTP. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setAuthError('');
    try {
      const data = await verifyAdminOtp(email, otp);
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
    } catch (err) {
      setAuthError('Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setStep(1);
    setOtp('');
    localStorage.removeItem('admin_token');
  };

  // Auth View
  if (!token) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box">
          <h2>Admin Access</h2>
          {authError && <div className="admin-error">{authError}</div>}
          
          {step === 1 ? (
            <form onSubmit={handleRequestOtp}>
              <p>Enter your admin email to receive a one-time password.</p>
              <input 
                type="email" 
                placeholder="Admin Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Request OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <p>Enter the 6-digit code sent to your email.</p>
              <input 
                type="text" 
                placeholder="6-digit OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button type="button" className="admin-back-btn" onClick={() => setStep(1)}>
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  };

  const selectedSession = sessions.find(s => s._id === selectedSessionId);

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>Chat Sessions</h3>
          <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="admin-session-list">
          {fetchError && <div className="admin-error">{fetchError}</div>}
          {sessions.length === 0 && !fetchError && <p className="admin-empty">No sessions found.</p>}
          {sessions.map((session) => {
            const firstMsg = session.messages && session.messages.find(m => m.role === 'user');
            const previewText = firstMsg ? firstMsg.content.substring(0, 40) + '...' : 'Empty session';
            const isActive = session._id === selectedSessionId;
            
            return (
              <div 
                key={session._id} 
                className={`admin-session-item ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedSessionId(session._id)}
              >
                <div className="session-date">{formatDate(session.updatedAt)}</div>
                <div className="session-preview">{previewText}</div>
                <div className="session-count">{session.messages?.length || 0} msgs</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {selectedSession ? (
          <div className="admin-chat-view">
            <div className="admin-chat-header">
              <h2>Session Details</h2>
              <span className="admin-session-id">ID: {selectedSession._id}</span>
              <span className="admin-session-time">Created: {formatDate(selectedSession.createdAt)}</span>
            </div>
            <div className="admin-chat-messages">
              {(!selectedSession.messages || selectedSession.messages.length === 0) ? (
                <p className="admin-empty">No messages in this session.</p>
              ) : (
                selectedSession.messages.map((msg, idx) => (
                  <div key={idx} className={`admin-msg-row ${msg.role}`}>
                    <div className="admin-msg-bubble">
                      <div className="admin-msg-role">{msg.role === 'assistant' ? 'AI' : 'User'}</div>
                      <div className="admin-msg-text">{msg.content}</div>
                      <div className="admin-msg-time">{formatDate(msg.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="admin-no-selection">
            <p>Select a session from the sidebar to view the conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
