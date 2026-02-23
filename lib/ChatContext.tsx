'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Message, Channel, ChatApiRequest } from './types';
import { AGENTS, getAgentById } from './agents';

// Generate unique ID for messages
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize channels with teamchat and one DM per agent
function initializeChannels(): Record<string, Channel> {
  const channels: Record<string, Channel> = {
    teamchat: {
      id: 'teamchat',
      name: '#teamchat',
      type: 'group',
      messages: [],
      unreadCount: 0,
    },
  };

  // Create DM channel for each agent
  AGENTS.forEach(agent => {
    channels[agent.id] = {
      id: agent.id,
      name: agent.name,
      type: 'dm',
      agentId: agent.id,
      messages: [],
      unreadCount: 0,
    };
  });

  return channels;
}

// Save a single message to the database via API
async function persistMessage(channelId: string, message: Message): Promise<void> {
  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: message.id,
        channel: channelId,
        role: message.sender,
        agentId: message.agentId,
        content: message.content,
        timestamp: message.timestamp instanceof Date 
          ? message.timestamp.toISOString() 
          : message.timestamp,
        tags: message.tags,
      }),
    });
  } catch (error) {
    console.error('Failed to persist message:', error);
  }
}

interface ChatContextType {
  activeChannel: string;
  channels: Record<string, Channel>;
  isLoading: boolean;
  typingAgent: string | null;
  historyLoaded: boolean;
  setActiveChannel: (channelId: string) => void;
  addMessage: (channelId: string, message: Message) => void;
  sendMessage: (content: string, taggedAgentIds?: string[]) => Promise<void>;
  getMessages: (channelId: string) => Message[];
  clearHistory: (channelId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChannel, setActiveChannelState] = useState('teamchat');
  const [channels, setChannels] = useState<Record<string, Channel>>(initializeChannels);
  const [isLoading, setIsLoading] = useState(false);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load conversation history from database on startup
  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch('/api/messages?all=true');
        const data = await response.json();
        
        if (data.channelMessages) {
          setChannels(prev => {
            const updated = { ...prev };
            
            // Populate each channel with its saved messages
            Object.entries(data.channelMessages).forEach(([channelId, messages]) => {
              if (updated[channelId]) {
                // Convert timestamp strings back to Date objects
                const parsedMessages = (messages as any[]).map(msg => ({
                  id: msg.id,
                  content: msg.content,
                  sender: msg.role as 'user' | 'agent',
                  agentId: msg.agentId,
                  timestamp: new Date(msg.timestamp),
                  tags: msg.tags,
                }));
                
                updated[channelId] = {
                  ...updated[channelId],
                  messages: parsedMessages,
                };
              }
            });
            
            return updated;
          });
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setHistoryLoaded(true);
      }
    }
    
    loadHistory();
  }, []);

  // Set active channel and reset unread count
  const setActiveChannel = useCallback((channelId: string) => {
    setActiveChannelState(channelId);
    setChannels(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        unreadCount: 0,
      },
    }));
  }, []);

  // Add a message to a specific channel and persist to database
  const addMessage = useCallback((channelId: string, message: Message, shouldPersist = true) => {
    setChannels(prev => {
      const channel = prev[channelId];
      if (!channel) return prev;

      const isActive = channelId === activeChannel;
      return {
        ...prev,
        [channelId]: {
          ...channel,
          messages: [...channel.messages, message],
          unreadCount: isActive ? 0 : channel.unreadCount + 1,
        },
      };
    });
    
    // Persist message to database
    if (shouldPersist) {
      persistMessage(channelId, message);
    }
  }, [activeChannel]);

  // Get messages for a channel
  const getMessages = useCallback((channelId: string): Message[] => {
    return channels[channelId]?.messages || [];
  }, [channels]);

  // Convert messages to API format
  const messagesToApiFormat = (messages: Message[]): Array<{ role: 'user' | 'assistant'; content: string }> => {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
    }));
  };

  // Send message and get agent response(s)
  const sendMessage = useCallback(async (content: string, taggedAgentIds?: string[]) => {
    const channel = channels[activeChannel];
    if (!channel) return;

    // Create and add user message
    const userMessage: Message = {
      id: generateId(),
      content,
      sender: 'user',
      timestamp: new Date(),
      tags: taggedAgentIds,
    };
    addMessage(activeChannel, userMessage);

    setIsLoading(true);

    try {
      const isDM = channel.type === 'dm';
      
      // Determine which agents should respond
      const respondingAgents = isDM 
        ? [channel.agentId!] 
        : (taggedAgentIds && taggedAgentIds.length > 0 ? taggedAgentIds : []);

      // Get current messages for context (including the new user message)
      const currentMessages = [...channel.messages, userMessage];

      // Send request to each tagged agent sequentially
      for (const agentId of respondingAgents) {
        setTypingAgent(agentId);

        const apiRequest: ChatApiRequest = {
          agentId,
          messages: messagesToApiFormat(currentMessages),
          isDM,
        };

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiRequest),
        });

        const data = await response.json();

        if (data.error) {
          // Add error message
          const errorMessage: Message = {
            id: generateId(),
            content: `Fel: ${data.error}`,
            sender: 'agent',
            agentId,
            timestamp: new Date(),
          };
          addMessage(activeChannel, errorMessage);
        } else {
          // Add agent response
          const agentMessage: Message = {
            id: generateId(),
            content: data.content,
            sender: 'agent',
            agentId,
            timestamp: new Date(),
          };
          addMessage(activeChannel, agentMessage);
          
          // Update current messages for next agent's context
          currentMessages.push(agentMessage);
        }

        // Add delay between agent responses for natural feel
        if (respondingAgents.indexOf(agentId) < respondingAgents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: generateId(),
        content: 'Kunde inte skicka meddelandet. Försök igen.',
        sender: 'agent',
        timestamp: new Date(),
      };
      addMessage(activeChannel, errorMessage);
    } finally {
      setIsLoading(false);
      setTypingAgent(null);
    }
  }, [activeChannel, channels, addMessage]);

  // Clear all messages for a channel (both local state and database)
  const clearHistory = useCallback(async (channelId: string) => {
    try {
      // Delete from database first
      await fetch(`/api/messages?channel=${channelId}`, {
        method: 'DELETE',
      });
      
      // Clear local state
      setChannels(prev => ({
        ...prev,
        [channelId]: {
          ...prev[channelId],
          messages: [],
          unreadCount: 0,
        },
      }));
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, []);

  const value: ChatContextType = {
    activeChannel,
    channels,
    isLoading,
    typingAgent,
    historyLoaded,
    setActiveChannel,
    addMessage,
    sendMessage,
    getMessages,
    clearHistory,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
