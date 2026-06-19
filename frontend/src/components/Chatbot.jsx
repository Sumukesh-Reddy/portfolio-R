import { useState, useRef, useEffect, useCallback } from 'react';
import VoiceInput from './VoiceInput';
import { createChatSession, sendChatMessage } from '../services/api';
import '../styles/chatbot.css';

/* ─────────────────────────────────────────
   Speech Synthesis helper
───────────────────────────────────────── */
const speak = (text) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  // Pick a natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Samantha'))
  );
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
};

const stopSpeaking = () => window.speechSynthesis.cancel();

/* ─────────────────────────────────────────
   Timestamp formatter
───────────────────────────────────────── */
const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ─────────────────────────────────────────
   Simple markdown-ish renderer
   Converts **bold**, bullet lists, numbered lists
───────────────────────────────────────── */
const renderBotText = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key={elements.length}>
        {listItems.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    // Bold
    const htmlLine = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Bullet point
    const bulletMatch = trimmed.match(/^[-•*]\s+(.+)/);
    const numMatch = trimmed.match(/^\d+\.\s+(.+)/);

    if (bulletMatch) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listItems.push(bulletMatch[1].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'));
    } else if (numMatch) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listItems.push(numMatch[1].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'));
    } else {
      flushList();
      elements.push(
        <p key={i} dangerouslySetInnerHTML={{ __html: htmlLine }} style={{ margin: '3px 0' }} />
      );
    }
  });

  flushList();
  return elements;
};

/* ─────────────────────────────────────────
   Quick-fire question chips
───────────────────────────────────────── */
const QUICK_CHIPS = [
  '🎓 Education',
  '💼 Projects',
  '🛠️ Skills',
  '🏆 Achievements',
  '📫 Contact',
];

const CHIP_QUESTIONS = {
  '🎓 Education': "Tell me about Sumukesh's education",
  '💼 Projects': "What projects has Sumukesh built?",
  '🛠️ Skills': "What are Sumukesh's technical skills?",
  '🏆 Achievements': "What are Sumukesh's key achievements?",
  '📫 Contact': "How can I contact Sumukesh?",
};

/* ─────────────────────────────────────────
   Main Chatbot Component
───────────────────────────────────────── */
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [hasOpened, setHasOpened] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionInitRef = useRef(false);

  /* ── Auto-scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  /* ── Initialize session on first open ── */
  useEffect(() => {
    if (!isOpen || sessionInitRef.current) return;
    sessionInitRef.current = true;

    const initSession = async () => {
      try {
        // Restore session from localStorage
        const stored = localStorage.getItem('chatbot_session_id');
        if (stored) {
          setSessionId(stored);
          return;
        }
        const data = await createChatSession();
        setSessionId(data.sessionId);
        localStorage.setItem('chatbot_session_id', data.sessionId);
      } catch (err) {
        setError('Could not connect to AI. Please try again later.');
        console.error('Session init error:', err);
      }
    };
    initSession();
  }, [isOpen]);

  /* ── Focus input when chat opens ── */
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  /* ── Open / close with animation ── */
  const openChat = () => {
    setIsOpen(true);
    setIsClosing(false);
    setHasOpened(true);
  };

  const closeChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 240);
  };

  const toggleChat = () => (isOpen ? closeChat() : openChat());

  /* ── Send message ── */
  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || !sessionId) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const data = await sendChatMessage(sessionId, trimmed);
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: data.answer,
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);

    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get a response. Is the AI server running?');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId, autoSpeak]);

  /* ── Handle textarea key (Enter to send, Shift+Enter for newline) ── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  /* ── Clear chat history ── */
  const clearHistory = () => {
    setMessages([]);
    stopSpeaking();
    setSpeakingMsgId(null);
    // Create a new session
    const newSession = async () => {
      try {
        const data = await createChatSession();
        setSessionId(data.sessionId);
        localStorage.setItem('chatbot_session_id', data.sessionId);
      } catch (err) {
        console.error('Error creating session:', err);
      }
    };
    newSession();
  };

  /* ── Speak / stop a single message ── */
  const toggleSpeakMsg = (msg) => {
    if (speakingMsgId === msg.id) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      speak(msg.content);
      setSpeakingMsgId(msg.id);
    }
  };

  /* ── Toggle global auto-speak ── */
  const toggleAutoSpeak = () => {
    if (autoSpeak) stopSpeaking();
    setAutoSpeak((v) => !v);
  };

  /* ─────────────────────────────── */
  return (
    <>
      {/* ─── Floating Toggle Button ─── */}
      <button
        id="chatbot-toggle-btn"
        className={`chatbot-toggle${isOpen ? ' open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
        title={isOpen ? 'Close AI Chat' : 'Chat with Sumukesh AI'}
      >
        {/* Notification dot only before first open */}
        {!hasOpened && <span className="chatbot-notif-dot" />}

        {/* Chat bubble icon */}
        <svg className="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>

        {/* X close icon */}
        <svg className="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* ─── Chat Window ─── */}
      {isOpen && (
        <div
          id="chatbot-window"
          className={`chatbot-window${isClosing ? ' closing' : ''}`}
          role="dialog"
          aria-label="AI Chatbot"
        >
          {/* ── Header ── */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-header-name">AI Assistant</div>
            </div>
            <div className="chatbot-header-actions">
              {/* Clear history */}
              <button
                id="chatbot-clear-btn"
                className="chatbot-icon-btn"
                onClick={clearHistory}
                title="Clear chat history"
                aria-label="Clear chat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>

              {/* Close */}
              <button
                id="chatbot-close-btn"
                className="chatbot-icon-btn"
                onClick={closeChat}
                title="Close chat"
                aria-label="Close chatbot"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="chatbot-messages" role="log" aria-live="polite">
            {messages.length === 0 ? (
              /* Welcome state */
              <div className="chatbot-welcome">
                <div className="chatbot-welcome-emoji">👋</div>
                <h3>Hi there! I'm Sumukesh's AI</h3>
                <p>
                  Ask me anything about Sumukesh's projects,
                  skills, education, or experience.
                </p>
                <div className="chatbot-welcome-chips">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      className="chatbot-chip"
                      onClick={() => sendMessage(CHIP_QUESTIONS[chip])}
                      disabled={!sessionId}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chatbot-msg ${msg.role}`}
                >
                  <div className="chatbot-msg-avatar">
                    {msg.role === 'bot' ? '🤖' : '👤'}
                  </div>
                  <div className="chatbot-msg-content">
                    <div className="chatbot-bubble">
                      {msg.role === 'bot'
                        ? renderBotText(msg.content)
                        : msg.content}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="chatbot-msg-time">{formatTime(msg.time)}</span>
                      {msg.role === 'bot' && (
                        <button
                          className="chatbot-speak-btn"
                          onClick={() => toggleSpeakMsg(msg)}
                          title={speakingMsgId === msg.id ? 'Stop speaking' : 'Read aloud'}
                          aria-label="Toggle speech for this message"
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="6" y="4" width="4" height="16"/>
                                <rect x="14" y="4" width="4" height="16"/>
                              </svg>
                              Stop
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                              </svg>
                              Play
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="chatbot-typing">
                <div className="chatbot-msg-avatar" style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
                <div className="chatbot-typing-bubble">
                  <div className="chatbot-dot" />
                  <div className="chatbot-dot" />
                  <div className="chatbot-dot" />
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="chatbot-error-banner">
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Listening banner ── */}
          {isListening && (
            <div className="chatbot-listening-banner">
              <div className="chatbot-listening-waves">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="chatbot-listening-wave" />
                ))}
              </div>
              Listening… speak now
            </div>
          )}

          {/* ── Input area ── */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-wrapper">
              <textarea
                id="chatbot-input"
                ref={inputRef}
                className="chatbot-input"
                placeholder="Ask me anything…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading || !sessionId}
                aria-label="Type your message"
              />
              <VoiceInput
                onTranscript={(text) => {
                  setInputValue(text);
                  // Auto-send after voice input
                  setTimeout(() => sendMessage(text), 300);
                }}
                onListeningChange={setIsListening}
              />
            </div>

            <button
              id="chatbot-send-btn"
              className="chatbot-send-btn"
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading || !sessionId}
              aria-label="Send message"
              title="Send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
