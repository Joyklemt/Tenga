// TypeScript types for the chat application

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agentId?: string;  // Only set when sender is 'agent'
  timestamp: Date;
  tags?: string[];   // Agent IDs that were tagged in this message
}

export interface Channel {
  id: string;
  name: string;
  type: 'group' | 'dm';
  agentId?: string;  // Only set for DM channels
  messages: Message[];
  unreadCount: number;
}

export interface ChatState {
  activeChannel: string;
  channels: Record<string, Channel>;
}

export interface ChatApiRequest {
  agentId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  isDM: boolean;
}

export interface ChatApiResponse {
  content: string;
  error?: string;
}
