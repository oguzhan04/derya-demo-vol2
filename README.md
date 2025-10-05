# Freight Forwarder Dashboard

A comprehensive dashboard for freight forwarding operations with analytics, document management, and customer experience monitoring.

## Features

- **Analytics Console**: Shipment tracking and performance analytics
- **Data Integration**: Connect external data sources
- **Document Upload**: Parse and index shipping documents
- **Customer Experience**: Monitor deal health and CX issues with AI-powered insights

## Customer Experience Module

The Customer Experience (CX) module provides intelligent monitoring of deal health and customer satisfaction through automated analysis of sales and operational data.

### Key Features

- **Real-time CX Scoring**: Win likelihood, CX risk, and margin risk analysis
- **Intelligent Notifications**: Automated alerts for SLA breaches, communication gaps, and operational issues
- **AI-Powered Briefs**: GPT-generated insights and recommendations
- **RAG Integration**: Document indexing and context-aware analysis
- **Configurable SLAs**: Customizable service level agreements and scoring weights

### API Endpoints

All CX endpoints use Edge Runtime for optimal performance on Vercel Free tier.

#### 1. Data Ingestion

**POST** `/api/cx/ingest`

Ingest new data and optionally create RAG indexes for document analysis.

```bash
curl -X POST http://localhost:5173/api/cx/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "upload",
    "payload": {
      "text": "Customer contract terms and shipping requirements...",
      "docId": "contract-001",
      "meta": {
        "type": "contract",
        "customer": "Acme Corp"
      }
    },
    "options": {
      "indexDocs": true
    }
  }'
```

**Response:**
```json
{
  "ok": true,
  "imported": {
    "deals": 0,
    "shipments": 0,
    "comms": 0,
    "docs": 1
  }
}
```

#### 2. Entity Scoring

**POST** `/api/cx/score`

Score entities for CX health and win likelihood.

```bash
curl -X POST http://localhost:5173/api/cx/score \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "all",
    "id": "deal-001"
  }'
```

**Response:**
```json
{
  "scores": [
    {
      "entity": {
        "kind": "deal",
        "id": "deal-001",
        "name": "Deal deal-001"
      },
      "winLikelihood": 35,
      "cxRisk": 85,
      "signals": [
        {
          "key": "comm_gap",
          "label": "Communication gap",
          "value": 0.8,
          "weight": 0.25
        }
      ]
    }
  ]
}
```

#### 3. Notification Generation

**POST** `/api/cx/notify`

Generate prioritized notifications for CX issues.

```bash
curl -X POST http://localhost:5173/api/cx/notify \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "all",
    "sla": {
      "quote_hours": 24,
      "dwell_days": 2
    }
  }'
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_001",
      "time": "2024-01-15T10:30:00Z",
      "type": "quote_sla_breach",
      "severity": "high",
      "entity": {
        "kind": "deal",
        "id": "deal-001",
        "name": "Acme Corp - Q1 Logistics"
      },
      "score": {
        "cxRisk": 85,
        "winLikelihood": 35
      },
      "evidence": [
        {
          "label": "Quote requested",
          "value": "2024-01-10T00:00:00Z",
          "timestamp": "2024-01-10T00:00:00Z"
        }
      ],
      "recommendation": "Provide quote immediately to maintain customer confidence",
      "links": [
        {
          "label": "View Deal",
          "ref": "/deals/deal-001"
        }
      ]
    }
  ]
}
```

#### 4. AI Brief Generation

**POST** `/api/cx/brief`

Generate AI-powered briefs with context from indexed documents.

```bash
curl -X POST http://localhost:5173/api/cx/brief \
  -H "Content-Type: application/json" \
  -d '{
    "entity": {
      "kind": "deal",
      "id": "deal-001"
    },
    "include": {
      "context": true,
      "actions": true
    }
  }'
```

**Response:**
```json
{
  "summary_md": "## Deal deal-001 Analysis\n\nThis deal requires immediate attention due to quote SLA breach and communication gaps.",
  "actions": [
    {
      "action": "Provide quote within 2 hours",
      "confidence": 90,
      "rationale": "Customer is waiting and SLA has been breached"
    }
  ],
  "sources": [
    {
      "label": "Contract document",
      "ref": "/documents/deal-001#chunk-1"
    }
  ]
}
```

### Environment Variables

Required for full functionality:

```bash
# OpenAI API Key (required for embeddings and briefs)
OPENAI_API_KEY=sk-your-openai-api-key

# Vercel Blob Token (required for document storage)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### Vercel Free Tier Considerations

- **Edge Runtime**: All endpoints use Edge Runtime for fast cold starts
- **Document Indices**: Keep RAG indexes small (< 1MB) to stay within limits
- **Short Requests**: API calls are optimized for < 10 second execution time
- **Server-Only Secrets**: OpenAI API calls only from server-side functions
- **JSON Storage**: Document indexes stored in Vercel Blob as JSON files

### Demo Data

The system includes realistic demo data that triggers various notification types:

- **Quote SLA Breaches**: Deals with overdue quotes
- **Dwell Time Issues**: Shipments exceeding dwell time limits
- **Communication Gaps**: Deals with no recent customer communication
- **Owner Idle**: Deals with no recent sales activity
- **POD Latency**: Delivered shipments without proof of delivery
- **Exception Streaks**: Multiple problematic shipments for same account
- **Sentiment Decline**: Negative communication trends

### Notification Types

1. **quote_sla_breach**: Quote turnaround time exceeded
2. **owner_idle**: Sales rep hasn't touched deal recently
3. **no_reply**: No customer communication within SLA
4. **booking_confirm_delay**: Booking confirmation overdue
5. **dwell_exceeded**: Shipment dwell time exceeded
6. **pod_latency**: Proof of delivery overdue
7. **exception_streak**: Multiple exceptions for same account
8. **sentiment_decline**: Negative sentiment trend detected

### Priority Scoring

Notifications are automatically prioritized using:

- **Severity Weight**: Critical (1.0) > High (0.7) > Medium (0.4) > Low (0.1)
- **Breach Size**: Magnitude of SLA violation
- **Account Tier**: Enterprise (1.5x) > Mid-market (1.2x) > Small business (1.0x)
- **Exception Count**: Number of recent issues

### Deduplication

The system automatically deduplicates notifications:

- Same entity + type within 24 hours are merged
- Highest severity is preserved
- Evidence is combined from all instances
- Most recent timestamp is used

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env.local
   # Add your OpenAI API key and Vercel Blob token
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open http://localhost:5173
   - Navigate to "Customer Experience" in the sidebar
   - Click "Analyze Now" to see demo notifications

## Deployment

Deploy to Vercel with zero configuration:

```bash
npm run build
vercel --prod
```

The application is optimized for Vercel Free tier with Edge Runtime and efficient resource usage.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Next.js API Routes with Edge Runtime
- **AI**: OpenAI GPT-4o-mini + text-embedding-3-small
- **Storage**: Vercel Blob for document indexes
- **Validation**: Zod schemas for type safety
- **State**: React hooks + localStorage for settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run build`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
