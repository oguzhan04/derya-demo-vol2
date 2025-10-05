import { NextRequest, NextResponse } from 'next/server';
import { IngestRequestSchema, IngestResponseSchema } from '../../src/cx/types.js';
import { chunkText, buildIndex } from '../../src/cx/rag.js';

// ============================================================================
// Environment Variables
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calls OpenAI Embeddings API to get vector embeddings for text chunks.
 */
async function getEmbeddings(texts: string[]): Promise<number[][]> {
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
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.data.map((item: any) => item.embedding);
}

/**
 * Stores a RAG index to Vercel Blob storage.
 */
async function storeIndex(docId: string, index: any): Promise<void> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required');
  }

  const response = await fetch(`https://api.vercel.com/v1/blob/cx/indexes/${docId}.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(index),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel Blob error: ${response.status} ${error}`);
  }
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = IngestRequestSchema.parse(body);

    // For MVP, handle upload source with text payload
    if (validatedRequest.source === 'upload') {
      const { text, docId, meta } = validatedRequest.payload || {};
      
      if (!text || !docId) {
        return NextResponse.json(
          { error: 'Missing required fields: text and docId' },
          { status: 400 }
        );
      }

      let docsImported = 0;

      // If indexDocs is true, process the text for RAG indexing
      if (validatedRequest.options?.indexDocs) {
        try {
          // Chunk the text
          const chunks = chunkText(text, 800, 100);
          
          // Get embeddings for chunks
          const embeddings = await getEmbeddings(chunks);
          
          // Build RAG index
          const index = buildIndex(docId, chunks, embeddings, 'text-embedding-3-small');
          
          // Store index to Vercel Blob
          await storeIndex(docId, index);
          
          docsImported = 1;
        } catch (error) {
          console.error('Error processing document for indexing:', error);
          return NextResponse.json(
            { error: 'Failed to process document for indexing' },
            { status: 500 }
          );
        }
      }

      // Return success response
      const response: IngestResponseSchema = {
        ok: true,
        imported: {
          deals: 0,
          shipments: 0,
          comms: 0,
          docs: docsImported,
        },
      };

      return NextResponse.json(response);
    }

    // Handle other sources (integration, existing) - placeholder for MVP
    if (validatedRequest.source === 'integration' || validatedRequest.source === 'existing') {
      // For MVP, just return success without processing
      const response: IngestResponseSchema = {
        ok: true,
        imported: {
          deals: 0,
          shipments: 0,
          comms: 0,
          docs: 0,
        },
      };

      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: 'Unsupported source type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Ingest API error:', error);

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
