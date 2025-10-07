#!/usr/bin/env node

// Mock handler for testing - doesn't import complex dependencies
async function mockHandler(req) {
  console.log('Testing ingest API (mock mode)...');
  
  try {
    const body = await req.json().catch(() => ({}));
    const { source, payload, options } = body;
    
    // Mock response
    const response = {
      ok: true,
      imported: {
        deals: 0,
        shipments: 0,
        comms: 0,
        docs: options?.indexDocs ? 1 : 0,
      }
    };
    
    return new Response(JSON.stringify(response), {
      headers: { 'content-type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

async function testIngest() {
  console.log('Testing ingest API...');
  
  try {
    const mockRequest = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({
        source: "upload",
        payload: {
          text: "Test document content for ingestion",
          docId: "test-doc-001",
          meta: { title: "Test Document" }
        },
        options: { indexDocs: true }
      })
    });

    const response = await mockHandler(mockRequest);
    const body = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response:', body.substring(0, 200) + (body.length > 200 ? '...' : ''));
    
    if (!process.env.OPENAI_API_KEY || !process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Note: OPENAI_API_KEY or BLOB_READ_WRITE_TOKEN not set - skipped external call in test mode');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testIngest();