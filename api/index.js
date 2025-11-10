// Root API handler for health checks and Vercel simulation
export default async function handler(req) {
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  // Handle GET for health checks
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'ok',
      message: 'API is running',
      endpoints: [
        '/api/analyze',
        '/api/ingest',
        '/api/search',
        '/api/cx/brief',
        '/api/cx/ingest',
        '/api/cx/notify',
        '/api/cx/score'
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // For other methods, return method not allowed
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  })
}

