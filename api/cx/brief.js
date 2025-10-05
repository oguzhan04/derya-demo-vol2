import { NextRequest, NextResponse } from 'next/server';
import { BriefRequestSchema, BriefResponseSchema } from '../../src/cx/types.js';
import { selectTopK } from '../../src/cx/rag.js';

// ============================================================================
// Environment Variables
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Retrieves a RAG index from Vercel Blob storage.
 */
async function getIndex(docId: string): Promise<any> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required');
  }

  const response = await fetch(`https://api.vercel.com/v1/blob/cx/indexes/${docId}.json`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Index not found
    }
    const error = await response.text();
    throw new Error(`Vercel Blob error: ${response.status} ${error}`);
  }

  return await response.json();
}

/**
 * Calls OpenAI Embeddings API to get vector embedding for a query.
 */
async function getQueryEmbedding(query: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: query,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Calls OpenAI Chat API to generate a brief with actions.
 */
async function generateBrief(context: string[], entityInfo: string): Promise<{ summary: string; actions: any[] }> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  const systemPrompt = `You are a CX analyst for ocean freight. Be concise and actionable. Analyze the provided context and generate:
1. A short markdown summary of the situation
2. Specific actions in JSON format with confidence scores and rationale

Return your response as JSON with this structure:
{
  "summary": "Brief markdown summary",
  "actions": [
    {
      "action": "Specific action to take",
      "confidence": 85,
      "rationale": "Why this action is recommended"
    }
  ]
}`;

  const userPrompt = `Entity: ${entityInfo}

Context snippets:
${context.map((snippet, i) => `${i + 1}. ${snippet}`).join('\n')}

Please provide a brief analysis and recommended actions.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      summary: content,
      actions: [
        {
          action: 'Review the situation and take appropriate action',
          confidence: 50,
          rationale: 'Unable to parse AI response, manual review recommended',
        },
      ],
    };
  }
}

/**
 * Gets entity information for the brief.
 */
function getEntityInfo(entity: { kind: string; id: string }): string {
  const entityType = entity.kind.charAt(0).toUpperCase() + entity.kind.slice(1);
  return `${entityType} ${entity.id}`;
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = BriefRequestSchema.parse(body);

    const { entity, include } = validatedRequest;

    // Get entity information
    const entityInfo = getEntityInfo(entity);

    // Try to find related RAG index
    let context: string[] = [];
    let sources: Array<{ label: string; ref: string }> = [];

    try {
      // Look for RAG index related to this entity
      const index = await getIndex(entity.id);
      
      if (index && include?.context !== false) {
        // Generate query embedding
        const query = `Customer experience analysis for ${entityInfo}`;
        const queryEmbedding = await getQueryEmbedding(query);
        
        // Find relevant context
        const topResults = selectTopK(index, queryEmbedding, 3);
        context = topResults.map(result => result.text);
        
        // Add sources
        sources = topResults.map(result => ({
          label: `Document chunk ${result.id}`,
          ref: `/documents/${entity.id}#${result.id}`,
        }));
      }
    } catch (error) {
      console.warn('Failed to retrieve RAG context:', error);
      // Continue without context
    }

    // If no context found, use default context
    if (context.length === 0) {
      context = [
        `${entityInfo} requires attention based on recent activity.`,
        'Customer communication patterns suggest potential issues.',
        'Operational metrics indicate areas for improvement.',
      ];
    }

    // Generate brief using OpenAI
    let briefResult;
    try {
      briefResult = await generateBrief(context, entityInfo);
    } catch (error) {
      console.error('Failed to generate brief:', error);
      
      // Fallback brief without AI
      briefResult = {
        summary: `## ${entityInfo} Analysis\n\nBased on available data, this ${entity.kind} requires attention. Review recent communications and operational metrics to identify specific issues.`,
        actions: [
          {
            action: 'Review recent communications',
            confidence: 80,
            rationale: 'Communication patterns often indicate customer satisfaction issues',
          },
          {
            action: 'Check operational metrics',
            confidence: 75,
            rationale: 'SLA breaches and delays impact customer experience',
          },
          {
            action: 'Schedule follow-up call',
            confidence: 70,
            rationale: 'Direct communication helps identify and resolve issues',
          },
        ],
      };
    }

    // Return response
    const response: BriefResponseSchema = {
      summary_md: briefResult.summary,
      actions: briefResult.actions,
      sources: sources.length > 0 ? sources : undefined,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Brief API error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Edge Runtime Configuration
// ============================================================================

export const config = {
  runtime: 'edge',
};
