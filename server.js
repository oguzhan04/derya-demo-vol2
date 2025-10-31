import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to convert Express request to Web API Request
function expressToWebRequest(expressReq) {
  const protocol = expressReq.protocol || 'http';
  const host = expressReq.get('host') || 'localhost:3001';
  const url = `${protocol}://${host}${expressReq.originalUrl}`;
  const headers = new Headers();
  Object.keys(expressReq.headers).forEach(key => {
    if (key !== 'host' && key !== 'content-length') {
      headers.set(key, expressReq.headers[key]);
    }
  });

  // Ensure Content-Type is set for JSON requests
  if (expressReq.method !== 'GET' && expressReq.method !== 'HEAD' && expressReq.body) {
    headers.set('Content-Type', 'application/json');
  }

  const body = expressReq.method !== 'GET' && expressReq.method !== 'HEAD' && expressReq.body
    ? JSON.stringify(expressReq.body) 
    : undefined;

  return new Request(url, {
    method: expressReq.method,
    headers: headers,
    body: body,
  });
}

// Helper function to convert Web API Response to Express response
async function sendWebResponse(webResponse, expressRes) {
  const status = webResponse.status;
  const headers = {};
  webResponse.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const body = await webResponse.text();
  
  expressRes.status(status).set(headers).send(body);
}

// API Routes
// CX Notify endpoint
app.post('/api/cx/notify', async (req, res) => {
  try {
    const { default: handler } = await import('./api/cx/notify.js');
    const webReq = expressToWebRequest(req);
    const webRes = await handler(webReq);
    await sendWebResponse(webRes, res);
  } catch (error) {
    console.error('Error handling /api/cx/notify:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// CX Score endpoint
app.post('/api/cx/score', async (req, res) => {
  try {
    const { default: handler } = await import('./api/cx/score.js');
    const webReq = expressToWebRequest(req);
    const webRes = await handler(webReq);
    await sendWebResponse(webRes, res);
  } catch (error) {
    console.error('Error handling /api/cx/score:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// CX Brief endpoint
app.post('/api/cx/brief', async (req, res) => {
  try {
    const { default: handler } = await import('./api/cx/brief.js');
    const webReq = expressToWebRequest(req);
    const webRes = await handler(webReq);
    await sendWebResponse(webRes, res);
  } catch (error) {
    console.error('Error handling /api/cx/brief:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// CX Ingest endpoint
app.post('/api/cx/ingest', async (req, res) => {
  try {
    const { default: handler } = await import('./api/cx/ingest.js');
    const webReq = expressToWebRequest(req);
    const webRes = await handler(webReq);
    await sendWebResponse(webRes, res);
  } catch (error) {
    console.error('Error handling /api/cx/ingest:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Other API endpoints
app.post('/api/ingest', async (req, res) => {
  try {
    const { default: handler } = await import('./api/ingest.js');
    const webReq = expressToWebRequest(req);
    const webRes = await handler(webReq);
    await sendWebResponse(webRes, res);
  } catch (error) {
    console.error('Error handling /api/ingest:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/search', async (req, res) => {
  try {
    const { default: handler } = await import('./api/search.js');
    const webReq = expressToWebRequest(req);
    const webRes = await handler(webReq);
    await sendWebResponse(webRes, res);
  } catch (error) {
    console.error('Error handling /api/search:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { default: handler } = await import('./api/analyze.js');
    const webReq = expressToWebRequest(req);
    const webRes = await handler(webReq);
    await sendWebResponse(webRes, res);
  } catch (error) {
    console.error('Error handling /api/analyze:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

