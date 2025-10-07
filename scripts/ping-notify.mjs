#!/usr/bin/env node

// Mock handler for testing - doesn't import complex dependencies
async function mockHandler(req) {
  console.log('Testing notify API (mock mode)...');
  
  try {
    const body = await req.json().catch(() => ({}));
    const { scope, sla } = body;
    
    // Mock response
    const response = {
      notifications: [
        {
          id: 'mock-notification-001',
          entity: { kind: 'deal', id: 'test-deal-001' },
          type: 'quote_response_delay',
          severity: 'medium',
          message: 'Mock notification for testing',
          createdAt: new Date().toISOString()
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

async function testNotify() {
  console.log('Testing notify API...');
  
  try {
    const mockRequest = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({
        scope: "deal",
        sla: {
          quoteResponseHours: 24,
          bookingConfirmationHours: 48
        }
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

testNotify();