# Customer Experience (CX) Module Specification

## Purpose

The Customer Experience (CX) module detects dealflow and post-sales CX issues and produces actionable, prioritized notifications with evidence and next steps. It fuses sales and operations signals to provide comprehensive visibility into customer experience health across the entire customer journey.

## Why Not HubSpot

Unlike traditional CRM tools like HubSpot, the CX module provides:

- **Fused Signals**: Combines sales and operations data streams for holistic CX visibility
- **Logistics SLAs**: Monitors specific logistics performance metrics (quote turnaround, booking confirmation, dwell time, POD delivery)
- **Root Cause Analysis**: Identifies underlying issues rather than just symptoms
- **Next-Best-Action**: Provides specific, actionable recommendations
- **GPT Narrative**: Generates human-readable insights on top of hard data signals

## Data Flow

```
Ingest → Normalize → (Optional RAG Index) → Heuristics Scoring → Notifications → (Optional GPT Brief)
```

1. **Ingest**: Raw data from various sources (CRM, logistics systems, communication platforms)
2. **Normalize**: Standardize data formats and resolve entity relationships
3. **RAG Index** (Optional): Create searchable knowledge base for context-aware analysis
4. **Heuristics Scoring**: Apply business rules and ML models to score CX health
5. **Notifications**: Generate prioritized alerts with evidence
6. **GPT Brief** (Optional): Generate narrative summaries and recommendations

## Entities

### Deal
```json
{
  "id": "string",
  "accountId": "string",
  "ownerId": "string",
  "stage": "string",
  "value": "number",
  "currency": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "closeDate": "datetime",
  "probability": "number",
  "source": "string",
  "tags": ["string"],
  "customFields": "object"
}
```

### Shipment
```json
{
  "id": "string",
  "dealId": "string",
  "accountId": "string",
  "trackingNumber": "string",
  "origin": "string",
  "destination": "string",
  "serviceType": "string",
  "weight": "number",
  "dimensions": {
    "length": "number",
    "width": "number",
    "height": "number"
  },
  "status": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "quoteRequestedAt": "datetime",
  "quoteProvidedAt": "datetime",
  "bookingConfirmedAt": "datetime",
  "pickedUpAt": "datetime",
  "deliveredAt": "datetime",
  "podReceivedAt": "datetime",
  "dwellDays": "number",
  "customFields": "object"
}
```

### Communication
```json
{
  "id": "string",
  "entityId": "string",
  "entityType": "deal|shipment|account",
  "channel": "email|phone|chat|meeting",
  "direction": "inbound|outbound",
  "participants": ["string"],
  "subject": "string",
  "content": "string",
  "timestamp": "datetime",
  "sentiment": "positive|neutral|negative",
  "tags": ["string"],
  "attachments": ["string"]
}
```

### ContractDoc
```json
{
  "id": "string",
  "dealId": "string",
  "accountId": "string",
  "type": "contract|quote|invoice|pod",
  "status": "draft|sent|signed|rejected",
  "version": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "sentAt": "datetime",
  "signedAt": "datetime",
  "expiresAt": "datetime",
  "fileUrl": "string",
  "metadata": "object"
}
```

## Notification JSON Contract

### Canonical Notification Schema
```json
{
  "id": "string",
  "time": "datetime",
  "type": "string",
  "severity": "low|medium|high|critical",
  "entity": {
    "kind": "deal|account|shipment",
    "id": "string",
    "name": "string"
  },
  "score": {
    "cxRisk": "number (0-100)",
    "winLikelihood": "number (0-100)",
    "marginRisk": "number (0-100)"
  },
  "evidence": [
    {
      "label": "string",
      "value": "string|number|boolean",
      "timestamp": "datetime"
    }
  ],
  "recommendation": "string",
  "links": [
    {
      "label": "string",
      "ref": "string"
    }
  ]
}
```

### Example Notifications

#### Deal at Risk
```json
{
  "id": "notif_001",
  "time": "2024-01-15T10:30:00Z",
  "type": "deal_at_risk",
  "severity": "high",
  "entity": {
    "kind": "deal",
    "id": "deal_123",
    "name": "Acme Corp - Q1 Logistics Contract"
  },
  "score": {
    "cxRisk": 85,
    "winLikelihood": 35,
    "marginRisk": 0
  },
  "evidence": [
    {
      "label": "No communication in 7 days",
      "value": "7",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "label": "Quote turnaround exceeded SLA",
      "value": "72 hours",
      "timestamp": "2024-01-12T14:20:00Z"
    },
    {
      "label": "Negative sentiment in last email",
      "value": "negative",
      "timestamp": "2024-01-08T09:15:00Z"
    }
  ],
  "recommendation": "Schedule immediate follow-up call to address concerns and provide updated timeline",
  "links": [
    {
      "label": "View Deal",
      "ref": "/deals/deal_123"
    },
    {
      "label": "Email Thread",
      "ref": "/communications/deal_123"
    }
  ]
}
```

#### Shipment Delay
```json
{
  "id": "notif_002",
  "time": "2024-01-15T14:45:00Z",
  "type": "shipment_delay",
  "severity": "medium",
  "entity": {
    "kind": "shipment",
    "id": "ship_456",
    "name": "SHIP-456 - NYC to LA"
  },
  "score": {
    "cxRisk": 65,
    "winLikelihood": 0,
    "marginRisk": 0
  },
  "evidence": [
    {
      "label": "Dwell time exceeded SLA",
      "value": "5 days",
      "timestamp": "2024-01-15T14:45:00Z"
    },
    {
      "label": "Customer inquiry about status",
      "value": "true",
      "timestamp": "2024-01-14T16:30:00Z"
    }
  ],
  "recommendation": "Provide proactive status update to customer and expedite pickup",
  "links": [
    {
      "label": "View Shipment",
      "ref": "/shipments/ship_456"
    },
    {
      "label": "Contact Customer",
      "ref": "/communications/ship_456"
    }
  ]
}
```

## Scoring System

### Score Types
- **cxRisk** (0-100): Overall customer experience risk score
- **winLikelihood** (0-100): Probability of deal closure (deals only)
- **marginRisk** (0-100): Risk to deal margin (only calculated when CX friction is detected)

### Scoring Logic
- **cxRisk**: Combines communication gaps, SLA breaches, sentiment analysis, and historical patterns
- **winLikelihood**: Based on deal stage, engagement level, timeline, and competitive factors
- **marginRisk**: Calculated when CX issues threaten deal value or pricing

## SLA Defaults

```json
{
  "quote_hours": 48,
  "booking_confirm_hours": 24,
  "dwell_days": 3,
  "pod_hours": 48,
  "no_reply_days": 7,
  "owner_touch_hours": {
    "pre": 72,
    "post": 96
  }
}
```

## Prioritization Formula

**Initial Formula:**
```
priority = (severity_weight * breach_size) + (exceptions_weight * recent_exceptions) + (account_tier_weight)
```

Where:
- `severity_weight`: 1.0 for critical, 0.7 for high, 0.4 for medium, 0.1 for low
- `breach_size`: Normalized measure of SLA breach magnitude
- `exceptions_weight`: 0.3 (configurable)
- `recent_exceptions`: Count of exceptions in last 30 days
- `account_tier_weight`: Based on account value/tier (0.1-1.0)

## Interaction Modes

1. **On-demand Analyze**: Manual trigger for specific entities or date ranges
2. **Auto-run on New Upload**: Automatic analysis when new data is ingested
3. **Batch Analyze All**: Comprehensive analysis across all entities

## Vercel Free Constraints

- **Function Duration**: Maximum 10 seconds execution time
- **Storage**: JSON indices stored in Vercel Blob
- **AI Calls**: OpenAI API calls only from server-side functions
- **Memory**: Limited to 1GB per function execution

## API Endpoints

### POST /api/cx/ingest
Ingest new data into the CX system.

**Request:**
```json
{
  "source": "string",
  "data": "object|array",
  "entityType": "deal|shipment|communication|contractdoc",
  "timestamp": "datetime"
}
```

**Response:**
```json
{
  "success": "boolean",
  "ingestedCount": "number",
  "errors": ["string"],
  "analysisTriggered": "boolean"
}
```

### POST /api/cx/score
Score entities for CX health.

**Request:**
```json
{
  "entityIds": ["string"],
  "entityType": "deal|shipment|account",
  "forceRefresh": "boolean"
}
```

**Response:**
```json
{
  "scores": [
    {
      "entityId": "string",
      "entityType": "string",
      "scores": {
        "cxRisk": "number",
        "winLikelihood": "number",
        "marginRisk": "number"
      },
      "timestamp": "datetime"
    }
  ]
}
```

### POST /api/cx/notify
Generate notifications based on scores and rules.

**Request:**
```json
{
  "entityIds": ["string"],
  "entityType": "deal|shipment|account",
  "severityThreshold": "low|medium|high|critical"
}
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "string",
      "time": "datetime",
      "type": "string",
      "severity": "string",
      "entity": "object",
      "score": "object",
      "evidence": "array",
      "recommendation": "string",
      "links": "array"
    }
  ]
}
```

### POST /api/cx/brief
Generate GPT-powered narrative briefs.

**Request:**
```json
{
  "entityId": "string",
  "entityType": "deal|shipment|account",
  "includeRecommendations": "boolean",
  "maxLength": "number"
}
```

**Response:**
```json
{
  "brief": "string",
  "keyInsights": ["string"],
  "recommendations": ["string"],
  "confidence": "number"
}
```

## UI Specification

### /customer-experience Page

#### Layout
- **Header**: Page title, "Analyze Now" button, settings icon
- **Filters Panel**: Entity type, severity, date range, account tier
- **Notifications Table**: Sortable table with columns for severity, entity, score, time, recommendation
- **Detail Drawer**: Slide-out panel for detailed notification view

#### Filters
```json
{
  "entityType": "all|deal|shipment|account",
  "severity": "all|low|medium|high|critical",
  "dateRange": {
    "start": "datetime",
    "end": "datetime"
  },
  "accountTier": "all|enterprise|mid-market|small-business",
  "scoreThreshold": {
    "cxRisk": "number",
    "winLikelihood": "number"
  }
}
```

#### Notifications Table Columns
1. **Severity**: Color-coded badge
2. **Entity**: Name and type with link
3. **Score**: cxRisk, winLikelihood (if applicable)
4. **Time**: Relative time with tooltip
5. **Recommendation**: Truncated text with "View Details" link
6. **Actions**: Quick actions dropdown

#### Detail Drawer Components
1. **Timeline**: Chronological view of events and communications
2. **Signals**: Evidence breakdown with timestamps
3. **Score Details**: Explanation of scoring factors
4. **Recommendations**: Actionable next steps
5. **Related Entities**: Links to connected deals, shipments, communications

#### Settings Panel
- **SLA Thresholds**: Configurable SLA values
- **Scoring Weights**: Adjustable weights for prioritization formula
- **Notification Preferences**: Email/SMS alerts, frequency settings
- **Account Tiers**: Define account tier classifications

## Implementation Notes

- All timestamps should be in ISO 8601 format with timezone
- Entity IDs should be globally unique across all entity types
- Scores should be cached with TTL for performance
- Notifications should be deduplicated based on entity and type
- GPT briefs should include confidence scores and fallback to rule-based summaries
- All API responses should include pagination for large datasets
- Error responses should follow consistent format with error codes and messages

## Acceptance Criteria

- [ ] Markdown specification is precise and comprehensive
- [ ] JSON schemas are complete with examples
- [ ] API contracts are well-defined with request/response formats
- [ ] UI specification includes all required components and interactions
- [ ] SLA defaults and scoring formulas are clearly documented
- [ ] Vercel constraints are addressed in design
- [ ] Specification can guide subsequent implementation phases
