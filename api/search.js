/**
 * Vercel Edge Function: Vector Search
 * 
 * POST /api/search
 * Body: { docId: string, query: string }
 * 
 * Retrieves document index from Vercel Blob,
 * generates query embedding,
 * performs cosine similarity search,
 * returns top matching chunks.
 */

export const config = {
  runtime: 'edge',
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Generate embedding for query text
 */
async function generateQueryEmbedding(query, apiKey) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: query,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${error}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

/**
 * Retrieve index from Vercel Blob
 */
async function getIndex(docId, blobToken) {
  const response = await fetch(`https://blob.vercel-storage.com/indexes/${docId}.json`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${blobToken}`,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Document index not found: ${docId}`)
    }
    const error = await response.text()
    throw new Error(`Blob storage error: ${response.status} ${error}`)
  }

  return await response.json()
}

/**
 * Perform vector search and return top results
 */
function searchChunks(queryEmbedding, index, topK = 5) {
  const results = []

  for (const item of index.items) {
    const similarity = cosineSimilarity(queryEmbedding, item.vector)
    results.push({
      id: item.id,
      text: item.text,
      score: similarity,
    })
  }

  // Sort by similarity score (descending)
  results.sort((a, b) => b.score - a.score)

  // Return top K results
  return results.slice(0, topK)
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
      endpoint: '/api/search',
      method: 'POST',
      description: 'Search documents using vector similarity'
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
    const { docId, query } = await req.json()

    // Validate required fields
    if (!docId || !query) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: docId and query' 
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

    // Retrieve document index
    const index = await getIndex(docId, blobToken)

    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query, openaiApiKey)

    // Perform vector search
    const topResults = searchChunks(queryEmbedding, index)

    // Return search results
    return new Response(JSON.stringify({ 
      ok: true,
      top: topResults,
      docId,
      query,
      totalChunks: index.items.length,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Search error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
