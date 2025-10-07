import { scoreWinLikelihood, scoreCxRisk } from '../../src/cx/heuristics.ts';
import { DEFAULT_SLA } from '../../src/cx/config.ts';
import { filterDemoData } from '../../src/cx/demoData.ts';

// ============================================================================
// Sample Data Store (In-Memory for MVP)
// ============================================================================

// Temporary in-memory store for MVP - in production this would be a database
const sampleData = {
  deals: [
    {
      id: 'deal-001',
      accountId: 'account-001',
      ownerId: 'owner-001',
      stage: 'proposal',
      value: 50000,
      currency: 'USD',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      closeDate: '2024-02-01T00:00:00Z',
      probability: 75,
      source: 'website',
      tags: ['urgent', 'enterprise'],
    },
    {
      id: 'deal-002',
      accountId: 'account-002',
      ownerId: 'owner-002',
      stage: 'negotiation',
      value: 25000,
      currency: 'USD',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-14T00:00:00Z',
      closeDate: '2024-01-30T00:00:00Z',
      probability: 60,
      source: 'referral',
      tags: ['mid-market'],
    },
  ],
  shipments: [
    {
      id: 'ship-001',
      dealId: 'deal-001',
      accountId: 'account-001',
      trackingNumber: 'TRK123456',
      origin: 'New York',
      destination: 'Los Angeles',
      serviceType: 'ground',
      weight: 1000,
      status: 'in-transit',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      quoteRequestedAt: '2024-01-10T00:00:00Z',
      quoteProvidedAt: '2024-01-12T00:00:00Z',
      bookingConfirmedAt: '2024-01-13T00:00:00Z',
      pickedUpAt: '2024-01-14T00:00:00Z',
      dwellDays: 2,
    },
    {
      id: 'ship-002',
      dealId: 'deal-002',
      accountId: 'account-002',
      trackingNumber: 'TRK789012',
      origin: 'Chicago',
      destination: 'Miami',
      serviceType: 'air',
      weight: 500,
      status: 'delayed',
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      quoteRequestedAt: '2024-01-12T00:00:00Z',
      quoteProvidedAt: '2024-01-13T00:00:00Z',
      dwellDays: 4,
    },
  ],
  comms: [
    {
      id: 'comm-001',
      entityId: 'deal-001',
      entityType: 'deal',
      channel: 'email',
      direction: 'inbound',
      participants: ['customer@example.com', 'sales@company.com'],
      subject: 'Quote Request',
      content: 'We need a quote for our upcoming shipment.',
      timestamp: '2024-01-10T00:00:00Z',
      sentiment: 'positive',
      tags: ['quote-request'],
    },
    {
      id: 'comm-002',
      entityId: 'deal-001',
      entityType: 'deal',
      channel: 'email',
      direction: 'outbound',
      participants: ['customer@example.com', 'sales@company.com'],
      subject: 'Quote Provided',
      content: 'Here is your quote for the shipment.',
      timestamp: '2024-01-12T00:00:00Z',
      sentiment: 'positive',
      tags: ['quote-response'],
    },
    {
      id: 'comm-003',
      entityId: 'deal-002',
      entityType: 'deal',
      channel: 'phone',
      direction: 'inbound',
      participants: ['customer2@example.com', 'sales@company.com'],
      subject: 'Follow-up Call',
      content: 'Customer called about delayed shipment.',
      timestamp: '2024-01-14T00:00:00Z',
      sentiment: 'negative',
      tags: ['complaint'],
    },
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets sample data based on scope and optional ID filter.
 */
function getSampleData(scope, id) {
  let deals = sampleData.deals;
  let shipments = sampleData.shipments;
  let comms = sampleData.comms;

  // Filter by ID if provided
  if (id) {
    if (scope === 'deal') {
      deals = deals.filter(d => d.id === id);
      shipments = shipments.filter(s => s.dealId === id);
      comms = comms.filter(c => c.entityId === id);
    } else if (scope === 'account') {
      deals = deals.filter(d => d.accountId === id);
      shipments = shipments.filter(s => s.accountId === id);
      comms = comms.filter(c => c.entityId === id);
    }
  }

  return { deals, shipments, comms };
}

/**
 * Scores entities using heuristics functions.
 */
function scoreEntities(deals, shipments, comms, sla) {
  const scores = [];

  for (const deal of deals) {
    const dealShipments = shipments.filter(s => s.dealId === deal.id);
    const dealComms = comms.filter(c => c.entityId === deal.id);

    // Score win likelihood
    const winLikelihoodResult = scoreWinLikelihood(deal, dealComms, sla);
    
    // Score CX risk
    const cxRiskResult = scoreCxRisk(deal, dealShipments, dealComms, sla);

    scores.push({
      entity: {
        kind: 'deal',
        id: deal.id,
        name: `Deal ${deal.id}`,
      },
      winLikelihood: winLikelihoodResult.score,
      cxRisk: cxRiskResult.score,
      marginRisk: undefined, // Only calculated when CX friction is detected
      signals: [
        ...winLikelihoodResult.signals,
        ...cxRiskResult.signals,
      ],
    });
  }

  return scores;
}

// ============================================================================
// API Handler
// ============================================================================

export default async function handler(req) {
  try {
    // Parse and validate request body
    const body = await req.json().catch(() => ({}));

    const { scope, id, payload } = body;

    // Use payload data if provided, otherwise use demo data
    let deals, shipments, comms;
    
    if (payload && payload.deals && payload.shipments && payload.comms) {
      deals = payload.deals;
      shipments = payload.shipments;
      comms = payload.comms;
    } else {
      // Get demo data based on scope
      const filteredData = filterDemoData(scope, id);
      deals = filteredData.deals;
      shipments = filteredData.shipments;
      comms = filteredData.comms;
    }

    if (deals.length === 0) {
      return new Response(JSON.stringify({ scores: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Score entities using heuristics
    const scores = scoreEntities(deals, shipments, comms, DEFAULT_SLA);

    // Return response
    const response = {
      scores,
    };

    return new Response(JSON.stringify(response), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Score API error:', error);

    // Handle other errors
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ============================================================================
// Edge Runtime Configuration
// ============================================================================

export const config = {
  runtime: 'edge',
};
