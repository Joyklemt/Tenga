'use client';

import { useEffect, useRef } from 'react';
import { AGENTS, Agent } from '@/lib/agents';

interface AgentPickerProps {
  query: string;
  onSelect: (agent: Agent) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export default function AgentPicker({ query, onSelect, onClose, position }: AgentPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Filter agents based on query
  const filteredAgents = AGENTS.filter(agent => {
    const searchTerm = query.toLowerCase();
    return (
      agent.name.toLowerCase().includes(searchTerm) ||
      agent.role.toLowerCase().includes(searchTerm)
    );
  });

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (filteredAgents.length === 0) {
    return null;
  }

  return (
    <div 
      ref={ref}
      className="agent-picker"
      style={{ 
        bottom: `calc(100% - ${position.top}px + 8px)`,
        left: position.left 
      }}
    >
      <div className="agent-picker-header">
        Agenter som matchar &quot;{query}&quot;
      </div>
      <div className="agent-picker-list">
        {filteredAgents.map(agent => (
          <button
            key={agent.id}
            className="agent-picker-item"
            onClick={() => onSelect(agent)}
          >
            <span 
              className="agent-picker-emoji"
              style={{ backgroundColor: `${agent.color}20` }}
            >
              {agent.emoji}
            </span>
            <div className="agent-picker-info">
              <span className="agent-picker-name" style={{ color: agent.color }}>
                {agent.name}
              </span>
              <span className="agent-picker-role">{agent.role}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
