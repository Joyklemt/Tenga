import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAgentById } from '@/lib/agents';
import { ChatApiRequest, ChatApiResponse } from '@/lib/types';

// Initialize Anthropic client with API key from environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest): Promise<NextResponse<ChatApiResponse>> {
  try {
    const body: ChatApiRequest = await request.json();
    const { agentId, messages, isDM } = body;

    // Find the agent configuration
    const agent = getAgentById(agentId);
    if (!agent) {
      return NextResponse.json(
        { content: '', error: `Agent not found: ${agentId}` },
        { status: 400 }
      );
    }

    // Modify system prompt for DM mode to be more personal
    let systemPrompt = agent.systemPrompt;
    if (isDM) {
      systemPrompt += `\n\nDetta är ett privat samtal mellan dig och användaren. Var lite mer personlig och avslappnad i tonen, men behåll din expertis och karaktär.`;
    }

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text');
    const content = textContent ? textContent.text : '';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle specific error types
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { content: '', error: `API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { content: '', error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    );
  }
}
