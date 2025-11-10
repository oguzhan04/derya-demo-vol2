/**
 * Vercel Edge Function: RAG Analysis with Streaming
 * 
 * POST /api/analyze
 * Body: { userPrompt: string, docId: string, query: string }
 * 
 * Performs vector search to find relevant chunks,
 * combines with user prompt for context-aware analysis,
 * streams response using OpenAI Chat Completions API.
 */

export const config = {
  runtime: 'edge',
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
 * Generate query embedding
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
 * Calculate cosine similarity
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
 * Find relevant chunks using vector search
 */
function findRelevantChunks(queryEmbedding, index, topK = 3) {
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

/**
 * Stream OpenAI Chat Completions response
 */
async function streamAnalysis(userPrompt, relevantChunks, docId, apiKey) {
  // Build context from relevant chunks
  const context = relevantChunks
    .map((chunk, i) => `[Chunk ${i + 1}] ${chunk.text}`)
    .join('\n\n')

  // Create system prompt for freight forwarding analysis
  const systemPrompt = `You are a freight forwarding expert AI assistant. Analyze the provided document chunks and answer the user's question with specific insights from the document.

Document Context:
${context}

Instructions:
- Provide specific insights based on the document content
- Reference relevant chunks when making points
- Focus on freight forwarding, logistics, and shipping details
- Be concise but comprehensive
- If information is not available in the chunks, say so clearly`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 0.1,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${error}`)
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
      endpoint: '/api/analyze',
      method: 'POST',
      description: 'Analyze documents using RAG'
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
    const { userPrompt, docId, query } = await req.json()

    // Validate required fields
    if (!userPrompt || !docId || !query) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: userPrompt, docId, and query' 
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

    // Find relevant chunks
    const relevantChunks = findRelevantChunks(queryEmbedding, index)

    if (relevantChunks.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No relevant chunks found for the query' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Stream the analysis
    const streamResponse = await streamAnalysis(userPrompt, relevantChunks, docId, openaiApiKey)

    // Return the streaming response with proper headers
    return new Response(streamResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Analyze error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
