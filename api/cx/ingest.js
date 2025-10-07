import { chunkText, buildIndex } from '../../src/cx/rag.ts';

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
async function getEmbeddings(texts) {
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
  return data.data.map((item) => item.embedding);
}

/**
 * Stores a RAG index to Vercel Blob storage.
 */
async function storeIndex(docId, index) {
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

export default async function handler(req) {
  try {
    // Parse and validate request body
    const body = await req.json().catch(() => ({}));

    // For MVP, handle upload source with text payload
    if (body.source === 'upload') {
      const { text, docId, meta } = body.payload || {};
      
      if (!text || !docId) {
        return new Response(JSON.stringify({ error: 'Missing required fields: text and docId' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }

      let docsImported = 0;

      // If indexDocs is true, process the text for RAG indexing
      if (body.options && body.options.indexDocs) {
        if (!BLOB_READ_WRITE_TOKEN) {
          console.log('BLOB_READ_WRITE_TOKEN not set - skipping document indexing');
          docsImported = 0;
        } else {
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
            return new Response(JSON.stringify({ error: 'Failed to process document for indexing' }), {
              status: 500,
              headers: { 'content-type': 'application/json' }
            });
          }
        }
      }

      // Return success response
      const response = {
        ok: true,
        imported: {
          deals: 0,
          shipments: 0,
          comms: 0,
          docs: docsImported,
        },
      };

      return new Response(JSON.stringify(response), {
        headers: { 'content-type': 'application/json' }
      });
    }

    // Handle other sources (integration, existing) - placeholder for MVP
    if (body.source === 'integration' || body.source === 'existing') {
      // For MVP, just return success without processing
      const response = {
        ok: true,
        imported: {
          deals: 0,
          shipments: 0,
          comms: 0,
          docs: 0,
        },
      };

      return new Response(JSON.stringify(response), {
        headers: { 'content-type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unsupported source type' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Ingest API error:', error);

    // Handle other errors
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ============================================================================
// Edge Runtime Configuration
// ============================================================================

export const config = {
  runtime: 'edge',
};
