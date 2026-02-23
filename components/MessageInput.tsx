'use client';

import { useState, useRef, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { useChat } from '@/lib/ChatContext';
import { AGENTS, Agent, getAgentById } from '@/lib/agents';
import AgentPicker from './AgentPicker';

export default function MessageInput() {
  const { activeChannel, sendMessage, isLoading } = useChat();
  const [input, setInput] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isGroupChat = activeChannel === 'teamchat';
  const dmAgent = !isGroupChat ? getAgentById(activeChannel) : null;

  // Parse @mentions from input and extract agent IDs
  const parseTaggedAgents = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const taggedIds: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionName = match[1].toLowerCase();
      const agent = AGENTS.find(a => 
        a.name.toLowerCase().includes(mentionName) ||
        a.name.split(' ').pop()?.toLowerCase() === mentionName
      );
      if (agent && !taggedIds.includes(agent.id)) {
        taggedIds.push(agent.id);
      }
    }

    return taggedIds;
  };

  // Handle input change and detect @mentions
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check for @ trigger
    if (isGroupChat) {
      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');

      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        // Only show picker if there's no space after @
        if (!textAfterAt.includes(' ')) {
          setPickerQuery(textAfterAt);
          setShowPicker(true);
          
          // Calculate position for picker
          const textarea = textareaRef.current;
          if (textarea) {
            setPickerPosition({
              top: textarea.offsetTop,
              left: Math.min(lastAtIndex * 8, 200), // Approximate character width
            });
          }
          return;
        }
      }
    }

    setShowPicker(false);
  };

  // Handle agent selection from picker
  const handleAgentSelect = (agent: Agent) => {
    const cursorPos = textareaRef.current?.selectionStart || input.length;
    const textBeforeCursor = input.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Replace @query with @AgentName
      const textAfterCursor = input.slice(cursorPos);
      const shortName = agent.name.split(' ').pop() || agent.name;
      const newInput = input.slice(0, lastAtIndex) + `@${shortName} ` + textAfterCursor;
      setInput(newInput);
    }

    setShowPicker(false);
    textareaRef.current?.focus();
  };

  // Quick-tag agent with emoji button
  const handleQuickTag = (agent: Agent) => {
    const shortName = agent.name.split(' ').pop() || agent.name;
    const newInput = input + (input && !input.endsWith(' ') ? ' ' : '') + `@${shortName} `;
    setInput(newInput);
    textareaRef.current?.focus();
  };

  // Handle send message
  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    if (isGroupChat) {
      const taggedAgentIds = parseTaggedAgents(trimmedInput);
      if (taggedAgentIds.length === 0) {
        // Show hint to tag agents
        return;
      }
      await sendMessage(trimmedInput, taggedAgentIds);
    } else {
      // DM - send directly to agent
      await sendMessage(trimmedInput);
    }

    setInput('');
  }, [input, isLoading, isGroupChat, sendMessage]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input-container">
      {/* Agent Picker Popup */}
      {showPicker && (
        <AgentPicker
          query={pickerQuery}
          onSelect={handleAgentSelect}
          onClose={() => setShowPicker(false)}
          position={pickerPosition}
        />
      )}

      {/* Quick-tag buttons (only in group chat) */}
      {isGroupChat && (
        <div className="quick-tags">
          <span className="quick-tags-label">Snabbtagga:</span>
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              className="quick-tag-btn"
              onClick={() => handleQuickTag(agent)}
              title={`Tagga ${agent.name}`}
              style={{ 
                backgroundColor: `${agent.color}15`,
                borderColor: `${agent.color}40`
              }}
            >
              {agent.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="message-input-wrapper">
        <textarea
          ref={textareaRef}
          className="message-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isGroupChat 
              ? 'Skriv ett meddelande och tagga agenter med @...' 
              : `Meddelande till ${dmAgent?.name}...`
          }
          disabled={isLoading}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <span className="send-loading">...</span>
          ) : (
            <svg viewBox="0 0 24 24" className="send-icon">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hint for group chat */}
      {isGroupChat && input.trim() && parseTaggedAgents(input).length === 0 && (
        <p className="input-hint">
          Tagga minst en agent med @ för att få svar
        </p>
      )}
    </div>
  );
}
