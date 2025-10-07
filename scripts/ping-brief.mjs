#!/usr/bin/env node

// Mock handler for testing - doesn't import complex dependencies
async function mockHandler(req) {
  console.log('Testing brief API (mock mode)...');
  
  try {
    const body = await req.json().catch(() => ({}));
    const { entity, include } = body;
    
    // Mock response
    const response = {
      summary_md: `## ${entity?.kind || 'Entity'} Analysis\n\nMock analysis for testing purposes.`,
      actions: [
        {
          action: 'Review entity status',
          confidence: 85,
          rationale: 'Mock action for testing'
        }
      ],
      sources: undefined
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

async function testBrief() {
  console.log('Testing brief API...');
  
  try {
    const mockRequest = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({
        entity: { kind: "deal", id: "test-deal-001" },
        include: { context: true }
      })
    });

    const response = await mockHandler(mockRequest);
    const body = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response:', body.substring(0, 200) + (body.length > 200 ? '...' : ''));
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('Note: OPENAI_API_KEY not set - skipped external call in test mode');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBrief();