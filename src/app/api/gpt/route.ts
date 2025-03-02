import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sendResponseEmail } from '@/lib/email';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define types for better type safety
type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { prompt, context, temperature = 0.7, max_tokens = 500 } = body;

    // Validate the request
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required', code: 'missing_prompt' },
        { status: 400 }
      );
    }

    // Prepare the messages for OpenAI
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: context || 'Du bist ein hilfreicher Assistent, der präzise und informative Antworten gibt.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature,
      max_tokens,
    });

    // Extract the response
    const result = completion.choices[0]?.message?.content || '';
    
    // Calculate token usage
    const tokens = {
      prompt: completion.usage?.prompt_tokens || 0,
      completion: completion.usage?.completion_tokens || 0,
      total: completion.usage?.total_tokens || 0,
    };

    // Send email with the response
    if (result) {
      await sendResponseEmail(prompt, result);
    }

    // Return the response
    return NextResponse.json({
      result,
      tokens,
      id: completion.id,
    });
  } catch (error: unknown) {
    console.error('Error calling OpenAI:', error);
    
    // Type guard to check if error is an object with response property
    const isOpenAIError = (err: unknown): err is { 
      response: { 
        data: { 
          error: { 
            message: string; 
            code: string; 
          } 
        }; 
        status: number; 
      } 
    } => {
      return typeof err === 'object' && 
             err !== null && 
             'response' in err && 
             typeof (err as {response: unknown}).response === 'object';
    };
    
    // Handle different types of errors
    if (isOpenAIError(error)) {
      // OpenAI API error
      return NextResponse.json(
        { 
          error: error.response.data.error.message || 'OpenAI API error', 
          code: error.response.data.error.code || 'openai_error' 
        },
        { status: error.response.status || 500 }
      );
    } else {
      // Generic error
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return NextResponse.json(
        { error: errorMessage, code: 'internal_error' },
        { status: 500 }
      );
    }
  }
} 