# RAG Pipeline Implementation

A mini-RAG (Retrieval-Augmented Generation) pipeline built with Vercel Edge Functions and OpenAI APIs.

## 🏗️ Architecture

```
Document → Chunking → Embeddings → Vector Store (Vercel Blob)
                                    ↓
User Query → Embeddings → Vector Search → Relevant Chunks → AI Analysis → Streamed Response
```

## 📁 API Endpoints

### `/api/ingest` - Document Ingestion
**POST** - Ingests documents and creates vector embeddings

```bash
curl -X POST /api/ingest \
  -H "Content-Type: application/json" \
  -d '{"docId": "demo1", "text": "Your document text here...", "meta": {"type": "invoice"}}'
```

**Response:**
```json
{"ok": true, "chunks": 5}
```

### `/api/search` - Vector Search
**POST** - Searches for relevant document chunks

```bash
curl -X POST /api/search \
  -H "Content-Type: application/json" \
  -d '{"docId": "demo1", "query": "freight rates"}'
```

**Response:**
```json
{
  "ok": true,
  "top": [
    {"id": "demo1::0", "text": "chunk text...", "score": 0.85},
    {"id": "demo1::1", "text": "chunk text...", "score": 0.72}
  ],
  "docId": "demo1",
  "query": "freight rates",
  "totalChunks": 5
}
```

### `/api/analyze` - AI Analysis with Streaming
**POST** - Performs RAG analysis with streaming response

```bash
curl -X POST /api/analyze \
  -H "Content-Type: application/json" \
  -d '{"userPrompt": "What are the key details?", "docId": "demo1", "query": "key details"}'
```

**Response:** Streamed text (SSE-like)

## 🔧 Configuration

### Environment Variables

**Client-side (.env):**
```bash
VITE_OPENAI_API_KEY=sk-your-key-here
```

**Server-side (Vercel Environment Variables):**
```bash
OPENAI_API_KEY=sk-your-key-here
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### Vercel Blob Setup

1. Install Vercel Blob: `npm install @vercel/blob`
2. Get your blob token from Vercel dashboard
3. Add `BLOB_READ_WRITE_TOKEN` to environment variables

## 🚀 Features

- **Edge Runtime**: Fast, global deployment
- **Chunking**: ~800 words with 100-word overlap
- **Embeddings**: OpenAI `text-embedding-3-small`
- **Vector Search**: Cosine similarity
- **Streaming**: Real-time AI responses
- **Security**: All secrets server-side

## 📊 Performance

- **Chunking**: Handles documents up to ~200 chunks
- **Embeddings**: Batch processing for efficiency
- **Search**: Sub-second response times
- **Streaming**: Real-time token delivery

## 🧪 Testing

Run the test script:
```bash
./test-rag.sh
```

Or test manually:
```bash
# 1. Ingest a document
curl -X POST http://localhost:5174/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"docId":"test","text":"Your freight document text here..."}'

# 2. Search for relevant chunks
curl -X POST http://localhost:5174/api/search \
  -H "Content-Type: application/json" \
  -d '{"docId":"test","query":"freight rates"}'

# 3. Get AI analysis
curl -X POST http://localhost:5174/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"What are the shipping details?","docId":"test","query":"shipping details"}'
```

## 🔒 Security

- API keys stored server-side only
- No client-side OpenAI calls
- Vercel Blob for secure storage
- Edge runtime for global performance

## 📈 Use Cases

- **Document Analysis**: Extract insights from freight documents
- **Question Answering**: Answer questions about specific documents
- **Content Search**: Find relevant information across documents
- **AI-Powered Insights**: Generate analysis with document context
