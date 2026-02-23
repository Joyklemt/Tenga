'use client';

import { useChat } from '@/lib/ChatContext';
import { AGENTS } from '@/lib/agents';

export default function Sidebar() {
  const { activeChannel, channels, setActiveChannel } = useChat();

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">Expert Team</h1>
        <span className="sidebar-subtitle">Ditt rådgivarteam</span>
      </div>

      {/* Group Channel */}
      <div className="sidebar-section">
        <h2 className="sidebar-section-title">Kanal</h2>
        <button
          className={`sidebar-item ${activeChannel === 'teamchat' ? 'active' : ''}`}
          onClick={() => setActiveChannel('teamchat')}
        >
          <span className="sidebar-item-icon">#</span>
          <span className="sidebar-item-name">teamchat</span>
          {channels.teamchat?.unreadCount > 0 && (
            <span className="sidebar-badge">{channels.teamchat.unreadCount}</span>
          )}
        </button>
      </div>

      {/* Direct Messages */}
      <div className="sidebar-section">
        <h2 className="sidebar-section-title">Direktmeddelanden</h2>
        {AGENTS.map(agent => {
          const channel = channels[agent.id];
          const isActive = activeChannel === agent.id;
          
          return (
            <button
              key={agent.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveChannel(agent.id)}
            >
              <span className="sidebar-item-emoji">{agent.emoji}</span>
              <span className="sidebar-item-name">{agent.name}</span>
              <span className="online-indicator" />
              {channel?.unreadCount > 0 && (
                <span className="sidebar-badge">{channel.unreadCount}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
