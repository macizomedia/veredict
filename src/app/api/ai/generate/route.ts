import { NextRequest, NextResponse } from 'next/server';
import { LabelType } from '@prisma/client';

interface GenerationRequest {
  topic: string;
  tone: string;
  style: string;
  minRead: number;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
    credibility: LabelType;
    source: string;
  }>;
  location?: {
    city: string;
    state: string;
    country: string;
  };
}

interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'list';
  content: string;
  sources?: string[];
  credibilityScore?: number;
}

interface GenerationResult {
  title: string;
  blocks: ContentBlock[];
  metadata: {
    estimatedReadTime: number;
    sourceCount: number;
    credibilityScore: number;
  };
}

// Mock content generation - in production, this would call the actual AI Agent
async function generateContent(request: GenerationRequest): Promise<GenerationResult> {
  // Simulate AI generation delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const { topic, tone, style, minRead, sources, location } = request;
  
  // Generate title based on topic and location
  const locationPrefix = location?.city ? `${location.city}: ` : '';
  const title = `${locationPrefix}${topic} - A Comprehensive Analysis`;
  
  // Calculate target word count (roughly 200 words per minute of reading)
  const targetWords = minRead * 200;
  const targetBlocks = Math.max(3, Math.ceil(targetWords / 150)); // ~150 words per block
  
  const blocks: ContentBlock[] = [
    {
      id: 'intro',
      type: 'paragraph',
      content: `Recent developments surrounding ${topic} have garnered significant attention from both local communities and broader stakeholders. ${location?.city ? `In ${location.city}, ` : ''}the implications of these changes are becoming increasingly apparent as various sectors adapt to new realities. This comprehensive analysis examines the multifaceted aspects of ${topic}, drawing from credible sources and expert insights to provide a balanced perspective on this evolving situation.`,
      sources: sources.slice(0, 2).map(s => s.source),
      credibilityScore: 0.85
    },
    {
      id: 'heading-1',
      type: 'heading',
      content: 'Current State of Affairs'
    },
    {
      id: 'current-state',
      type: 'paragraph',
      content: `The current landscape of ${topic} reflects a complex interplay of factors that have shaped its trajectory over recent months. According to official sources, key developments have included policy changes, community responses, and technological adaptations that collectively influence the broader narrative. ${style === 'analytical' ? 'Data analysis reveals' : 'Reports indicate'} that stakeholder engagement has been particularly robust, with various parties contributing to ongoing discussions about implementation and future directions.`,
      sources: sources.filter(s => s.credibility === 'OFFICIAL_PRESS_RELEASE' || s.credibility === 'ACCURATE').map(s => s.source),
      credibilityScore: 0.90
    }
  ];
  
  // Add more blocks based on target length
  if (targetBlocks > 3) {
    blocks.push(
      {
        id: 'heading-2',
        type: 'heading',
        content: 'Community Impact and Response'
      },
      {
        id: 'community-impact',
        type: 'paragraph',
        content: `The community response to ${topic} has been varied and nuanced, reflecting the diverse perspectives of local stakeholders. ${location?.city ? `${location.city} residents` : 'Community members'} have expressed both support and concern regarding various aspects of the initiative. Local leaders have emphasized the importance of transparent communication and inclusive decision-making processes to ensure that all voices are heard and considered in ongoing deliberations.`,
        sources: sources.filter(s => s.source.toLowerCase().includes('community')).map(s => s.source),
        credibilityScore: 0.75
      }
    );
  }
  
  if (targetBlocks > 5) {
    blocks.push(
      {
        id: 'expert-quote',
        type: 'quote',
        content: `"The significance of ${topic} cannot be understated in terms of its potential long-term implications for our community and similar initiatives nationwide."`,
        sources: ['Expert Analysis Institute'],
        credibilityScore: 0.80
      },
      {
        id: 'future-outlook',
        type: 'paragraph',
        content: `Looking ahead, the trajectory of ${topic} will likely depend on several key factors including continued stakeholder engagement, resource allocation, and adaptive management strategies. ${tone === 'formal' ? 'Preliminary assessments suggest' : 'Early indications show'} that success will require sustained collaboration between various parties and a commitment to evidence-based decision making. The coming months will be crucial in determining the ultimate impact and effectiveness of current approaches.`,
        sources: sources.slice(-2).map(s => s.source),
        credibilityScore: 0.70
      }
    );
  }
  
  // Calculate overall credibility score
  const credibilityScore = blocks
    .filter(b => b.credibilityScore)
    .reduce((sum, b) => sum + (b.credibilityScore || 0), 0) / blocks.filter(b => b.credibilityScore).length;
  
  return {
    title,
    blocks,
    metadata: {
      estimatedReadTime: minRead,
      sourceCount: sources.length,
      credibilityScore: Math.round(credibilityScore * 100) / 100
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { topic, sources } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { error: 'Research sources are required' },
        { status: 400 }
      );
    }

    const result = await generateContent(body);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
