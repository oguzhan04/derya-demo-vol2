/**
 * Vercel Edge Function: Document Ingestion with Embeddings
 * 
 * POST /api/ingest
 * Body: { docId: string, text: string, meta?: object }
 * 
 * Chunks text into ~800-word chunks with 100-word overlap,
 * generates embeddings using OpenAI text-embedding-3-small,
 * stores index to Vercel Blob.
 */

export const config = {
  runtime: 'edge',
}

// Chunking configuration
const CHUNK_SIZE_WORDS = 800
const OVERLAP_WORDS = 100

/**
 * Split text into chunks with overlap
 */
function chunkText(text, chunkSize = CHUNK_SIZE_WORDS, overlap = OVERLAP_WORDS) {
  const words = text.split(/\s+/)
  const chunks = []
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim()) {
      chunks.push(chunk.trim())
    }
    
    // Stop if we've reached the end
    if (i + chunkSize >= words.length) break
  }
  
  return chunks
}

/**
 * Generate embeddings for all chunks in one request
 */
async function generateEmbeddings(chunks, apiKey) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: chunks,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${error}`)
  }

  const data = await response.json()
  return data.data.map(item => item.embedding)
}

/**
 * Store index to Vercel Blob
 */
async function storeIndex(index, blobToken) {
  const response = await fetch(`https://blob.vercel-storage.com/indexes/${index.docId}.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${blobToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(index),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Blob storage error: ${response.status} ${error}`)
  }

  return response
}

export default async function handler(req) {
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  // Handle GET for health checks
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      endpoint: '/api/ingest',
      method: 'POST',
      description: 'Ingest documents for RAG indexing'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Parse request body
    const { docId, text, meta = {} } = await req.json()

    // Validate required fields
    if (!docId || !text) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: docId and text' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!openaiApiKey || !blobToken) {
      return new Response(JSON.stringify({ 
        error: 'Missing environment variables: OPENAI_API_KEY or BLOB_READ_WRITE_TOKEN' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Chunk the text
    const chunks = chunkText(text)
    
    if (chunks.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No valid chunks generated from text' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(chunks, openaiApiKey)

    // Build index structure
    const index = {
      version: 1,
      embedding_model: 'text-embedding-3-small',
      docId,
      meta,
      items: chunks.map((chunk, i) => ({
        id: `${docId}::${i}`,
        text: chunk,
        vector: embeddings[i],
      })),
    }

    // Store to Vercel Blob
    await storeIndex(index, blobToken)

    // Return success response
    return new Response(JSON.stringify({ 
      ok: true, 
      chunks: chunks.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Ingest error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
