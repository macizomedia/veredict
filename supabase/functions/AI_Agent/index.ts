import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Simplified AI Agent without LangGraph
serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        },
      });
    }

    // Only allow POST requests for AI generation
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        message: 'Use POST to generate content'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const { prompt, sources, tone, style, length } = requestData;
    
    if (!prompt) {
      return new Response(JSON.stringify({ 
        error: 'Prompt is required',
        example: {
          prompt: 'Write about renewable energy',
          sources: ['https://example.com'],
          tone: 'neutral',
          style: 'journalistic',
          length: 'short'
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get Google API Key
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY');
    if (!googleApiKey) {
      return new Response(JSON.stringify({
        error: 'Google API key not configured',
        message: 'GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable is required'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Set up streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              node: 'draft_node',
              status: 'starting',
              message: 'Generating content...'
            })}\n\n`)
          );

          // Generate content using Google Gemini API
          const contentResponse = await generateContent({
            prompt,
            sources: sources || [],
            tone: tone || 'neutral',
            style: style || 'standard',
            length: length || 'short',
            apiKey: googleApiKey
          });

          // Send drafting complete
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              node: 'draft_node',
              value: {
                draft: contentResponse.content
              }
            })}\n\n`)
          );

          // Validation step
          const reviewRequired = contentResponse.content.length < 50 || 
                                contentResponse.content.toLowerCase().includes('error');

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              node: 'validation_node',
              value: {
                reviewRequired
              }
            })}\n\n`)
          );

          // Format content into blocks
          if (!reviewRequired) {
            const contentBlocks = formatContentIntoBlocks(contentResponse.content);
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                node: 'format_node',
                value: {
                  contentBlocks
                }
              })}\n\n`)
            );
          }

          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              error: 'Content generation failed',
              details: error instanceof Error ? error.message : 'Unknown error',
            })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// Generate content using Google Gemini API
async function generateContent(params: {
  prompt: string;
  sources: string[];
  tone: string;
  style: string;
  length: string;
  apiKey: string;
}) {
  const { prompt, sources, tone, style, length, apiKey } = params;

  // Build the prompt
  const systemPrompt = `You are an expert content creator. Write a ${length}, ${tone}-toned article in a ${style} style about the following topic.

Topic: ${prompt}

${sources.length > 0 ? `Use the following sources for information: ${sources.join(', ')}` : ''}

Please provide a well-structured article with clear paragraphs. Do not include any special formatting markers.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate content';

    return { content };
  } catch (error) {
    console.error('Google API error:', error);
    throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Format content into blocks
function formatContentIntoBlocks(content: string) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((content, index) => {
    // First paragraph might be a title if it's short and doesn't end with punctuation
    if (index === 0 && content.length < 100 && !content.match(/[.!?]$/)) {
      return {
        type: 'heading',
        content: content.trim()
      };
    }
    
    return {
      type: 'paragraph',
      content: content.trim()
    };
  });
}
