'use client';

import { useChat } from '@/lib/ChatContext';
import { AGENTS } from '@/lib/agents';

// Props for mobile sidebar toggle functionality
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { activeChannel, channels, setActiveChannel } = useChat();

  // Handle channel selection - close sidebar on mobile after selection
  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
    onClose(); // Close sidebar on mobile after selecting
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header with close button for mobile */}
      <div className="sidebar-header">
        <div>
          <h1 className="sidebar-title">Expert Team</h1>
          <span className="sidebar-subtitle">Ditt rådgivarteam</span>
        </div>
        {/* Close button - only visible on mobile via CSS */}
        <button 
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Stäng meny"
        >
          ✕
        </button>
      </div>

      {/* Group Channel */}
      <div className="sidebar-section">
        <h2 className="sidebar-section-title">Kanal</h2>
        <button
          className={`sidebar-item ${activeChannel === 'teamchat' ? 'active' : ''}`}
          onClick={() => handleChannelSelect('teamchat')}
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
              onClick={() => handleChannelSelect(agent.id)}
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
