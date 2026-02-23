'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/lib/ChatContext';
import { getAgentById } from '@/lib/agents';
import Message from './Message';

// Props for mobile menu button
interface ChatViewProps {
  onMenuClick: () => void;
}

export default function ChatView({ onMenuClick }: ChatViewProps) {
  const { activeChannel, channels, typingAgent, clearHistory, historyLoaded } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const channel = channels[activeChannel];
  const messages = channel?.messages || [];

  // Handle clear history action
  const handleClearHistory = async () => {
    await clearHistory(activeChannel);
    setShowClearConfirm(false);
  };

  // Hide confirmation when switching channels
  useEffect(() => {
    setShowClearConfirm(false);
  }, [activeChannel]);

  // Get agent info for typing indicator
  const typingAgentInfo = typingAgent ? getAgentById(typingAgent) : null;

  // Get channel display info
  const isGroupChat = activeChannel === 'teamchat';
  const dmAgent = !isGroupChat ? getAgentById(activeChannel) : null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingAgent]);

  return (
    <div className="chat-view">
      {/* Channel Header */}
      <header className="chat-header">
        {/* Hamburger menu button - only visible on mobile */}
        <button 
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Öppna meny"
        >
          ☰
        </button>

        {isGroupChat ? (
          <>
            <span className="chat-header-icon">#</span>
            <div className="chat-header-info">
              <h2 className="chat-header-title">teamchat</h2>
              <p className="chat-header-description">
                Bolla idéer med hela teamet. Tagga agenter med @namn för att få svar.
              </p>
            </div>
          </>
        ) : dmAgent && (
          <>
            <span className="chat-header-emoji">{dmAgent.emoji}</span>
            <div className="chat-header-info">
              <h2 className="chat-header-title" style={{ color: dmAgent.color }}>
                {dmAgent.name}
              </h2>
              <p className="chat-header-description">{dmAgent.role}</p>
            </div>
            <span className="online-indicator large" />
          </>
        )}
        
        {/* Clear History Button - only show if there are messages */}
        {messages.length > 0 && (
          <div className="chat-header-actions">
            {showClearConfirm ? (
              <div className="clear-confirm">
                <span className="clear-confirm-text">Rensa historik?</span>
                <button 
                  className="clear-confirm-yes"
                  onClick={handleClearHistory}
                >
                  Ja
                </button>
                <button 
                  className="clear-confirm-no"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Nej
                </button>
              </div>
            ) : (
              <button 
                className="clear-history-btn"
                onClick={() => setShowClearConfirm(true)}
                title="Rensa konversationshistorik"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </header>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            {isGroupChat ? (
              <>
                <p className="chat-empty-title">Välkommen till teamchatten!</p>
                <p className="chat-empty-text">
                  Skriv ett meddelande och tagga en eller flera agenter med @ för att börja.
                </p>
                <p className="chat-empty-hint">
                  Prova: &quot;@Nova @Viktor Vad tycker ni om denna affärsidé?&quot;
                </p>
              </>
            ) : dmAgent && (
              <>
                <p className="chat-empty-title">
                  Privat konversation med {dmAgent.name} {dmAgent.emoji}
                </p>
                <p className="chat-empty-text">
                  Skriv vad som helst — {dmAgent.name} svarar direkt utan att behöva taggas.
                </p>
              </>
            )}
          </div>
        ) : (
          messages.map(message => (
            <Message key={message.id} message={message} />
          ))
        )}

        {/* Typing Indicator */}
        {typingAgentInfo && (
          <div className="typing-indicator">
            <span 
              className="typing-emoji"
              style={{ backgroundColor: `${typingAgentInfo.color}20` }}
            >
              {typingAgentInfo.emoji}
            </span>
            <span className="typing-text">
              {typingAgentInfo.name} skriver
            </span>
            <span className="typing-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
