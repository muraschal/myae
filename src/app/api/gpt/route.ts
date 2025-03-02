import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const messages = [
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
      model: 'gpt-4-turbo',
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

    // Return the response
    return NextResponse.json({
      result,
      tokens,
      id: completion.id,
    });
  } catch (error: any) {
    console.error('Error calling OpenAI:', error);
    
    // Handle different types of errors
    if (error.response) {
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
      return NextResponse.json(
        { error: error.message || 'Internal server error', code: 'internal_error' },
        { status: 500 }
      );
    }
  }
} 