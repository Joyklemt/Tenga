// API route for message persistence
// GET - fetch messages for a channel
// POST - save a new message
// DELETE - clear all messages for a channel

import { NextResponse } from 'next/server';
import { 
  getMessagesByChannel, 
  saveMessage, 
  deleteMessagesByChannel,
  getAllChannels 
} from '@/lib/db';

/**
 * GET /api/messages
 * Query params:
 * - channel: specific channel ID (optional)
 * - all: if "true", returns messages for all channels (optional)
 * 
 * Returns: { messages: [...] } or { channelMessages: { channel1: [...], ... } }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');
    const all = searchParams.get('all');

    // If requesting all channels at once
    if (all === 'true') {
      const channels = getAllChannels();
      const channelMessages = {};
      
      for (const ch of channels) {
        channelMessages[ch] = getMessagesByChannel(ch);
      }
      
      return NextResponse.json({ channelMessages });
    }

    // If requesting specific channel
    if (channel) {
      const messages = getMessagesByChannel(channel);
      return NextResponse.json({ messages });
    }

    // No channel specified - return error
    return NextResponse.json(
      { error: 'Missing channel parameter. Use ?channel=<id> or ?all=true' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Body: { id, channel, role, agentId?, content, timestamp, tags? }
 * 
 * Returns: { success: true, message: {...} }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { id, channel, role, content, timestamp } = body;
    
    if (!id || !channel || !role || !content || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: id, channel, role, content, timestamp' },
        { status: 400 }
      );
    }

    // Validate role value
    if (role !== 'user' && role !== 'agent') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "agent"' },
        { status: 400 }
      );
    }

    // Save message to database
    const message = saveMessage({
      id,
      channel,
      role,
      agentId: body.agentId,
      content,
      timestamp,
      tags: body.tags,
    });

    return NextResponse.json({ success: true, message });

  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages
 * Query params:
 * - channel: channel ID to clear (required)
 * 
 * Returns: { success: true, deleted: <count> }
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');

    if (!channel) {
      return NextResponse.json(
        { error: 'Missing channel parameter' },
        { status: 400 }
      );
    }

    const deleted = deleteMessagesByChannel(channel);
    
    return NextResponse.json({ success: true, deleted });

  } catch (error) {
    console.error('Error deleting messages:', error);
    return NextResponse.json(
      { error: 'Failed to delete messages' },
      { status: 500 }
    );
  }
}
