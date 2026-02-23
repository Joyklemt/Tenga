'use client';

import React from 'react';
import { Message as MessageType } from '@/lib/types';
import { getAgentById, AGENTS } from '@/lib/agents';

interface MessageProps {
  message: MessageType;
}

// Parse @mentions in text and highlight them
function parseContent(content: string, tags?: string[]) {
  // Regex to match @Name patterns
  const mentionRegex = /@(\w+)/g;
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Find the agent by name
    const mentionName = match[1];
    const agent = AGENTS.find(a => 
      a.name.toLowerCase().includes(mentionName.toLowerCase()) ||
      a.name.split(' ').pop()?.toLowerCase() === mentionName.toLowerCase()
    );

    if (agent) {
      // Highlighted mention with agent color
      parts.push(
        <span
          key={match.index}
          className="mention"
          style={{ backgroundColor: `${agent.color}30`, color: agent.color }}
        >
          @{agent.name.split(' ').pop()}
        </span>
      );
    } else {
      // Keep as plain text if agent not found
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.sender === 'user';
  const agent = message.agentId ? getAgentById(message.agentId) : null;

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-agent'}`}>
      {/* Agent avatar/emoji */}
      {!isUser && agent && (
        <div 
          className="message-avatar"
          style={{ backgroundColor: `${agent.color}20`, borderColor: agent.color }}
        >
          {agent.emoji}
        </div>
      )}

      <div className="message-content-wrapper">
        {/* Agent name header */}
        {!isUser && agent && (
          <div className="message-header">
            <span className="message-author" style={{ color: agent.color }}>
              {agent.name}
            </span>
            <span className="message-role">{agent.role}</span>
          </div>
        )}

        {/* Message content */}
        <div 
          className={`message-bubble ${isUser ? 'user-bubble' : 'agent-bubble'}`}
          style={!isUser && agent ? { borderLeftColor: agent.color } : {}}
        >
          <p className="message-text">
            {isUser ? parseContent(message.content, message.tags) : message.content}
          </p>
        </div>

        {/* Timestamp */}
        <span className="message-time">
          {message.timestamp.toLocaleTimeString('sv-SE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );
}
