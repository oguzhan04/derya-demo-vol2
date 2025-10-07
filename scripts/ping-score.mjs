#!/usr/bin/env node

// Mock handler for testing - doesn't import complex dependencies
async function mockHandler(req) {
  console.log('Testing score API (mock mode)...');
  
  try {
    const body = await req.json().catch(() => ({}));
    const { scope, id } = body;
    
    // Mock response
    const response = {
      scores: [
        {
          entity: { kind: 'deal', id: id || 'test-deal-001', name: 'Test Deal' },
          winLikelihood: 75,
          cxRisk: 25,
          marginRisk: undefined,
          signals: [
            { type: 'positive_communication', weight: 0.8 },
            { type: 'on_time_delivery', weight: 0.9 }
          ]
        }
      ]
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

async function testScore() {
  console.log('Testing score API...');
  
  try {
    const mockRequest = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({
        scope: "deal",
        id: "test-deal-001"
      })
    });

    const response = await mockHandler(mockRequest);
    const body = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response:', body.substring(0, 200) + (body.length > 200 ? '...' : ''));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testScore();