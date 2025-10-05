import { Deal, Shipment, Communication } from './types.js';

// ============================================================================
// Demo Data Generator
// ============================================================================

/**
 * Generates timestamps relative to now for realistic demo data
 */
function getTimestamp(daysAgo: number, hoursAgo: number = 0): string {
  const now = new Date();
  const timestamp = new Date(now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);
  return timestamp.toISOString();
}

// ============================================================================
// Demo Deals
// ============================================================================

export const deals: Deal[] = [
  {
    id: 'deal-001',
    accountId: 'account-001',
    ownerId: 'owner-001',
    stage: 'proposal',
    value: 75000,
    currency: 'USD',
    createdAt: getTimestamp(15),
    updatedAt: getTimestamp(2),
    closeDate: getTimestamp(-7), // Past due
    probability: 35,
    source: 'website',
    tags: ['urgent', 'enterprise'],
  },
  {
    id: 'deal-002',
    accountId: 'account-002',
    ownerId: 'owner-002',
    stage: 'negotiation',
    value: 45000,
    currency: 'USD',
    createdAt: getTimestamp(8),
    updatedAt: getTimestamp(1),
    closeDate: getTimestamp(-14), // Past due
    probability: 60,
    source: 'referral',
    tags: ['mid-market'],
  },
  {
    id: 'deal-003',
    accountId: 'account-003',
    ownerId: 'owner-003',
    stage: 'lead',
    value: 15000,
    currency: 'USD',
    createdAt: getTimestamp(5),
    updatedAt: getTimestamp(5), // No recent updates - should trigger owner idle
    closeDate: getTimestamp(-21),
    probability: 25,
    source: 'cold-call',
    tags: ['small-business'],
  },
  {
    id: 'deal-004',
    accountId: 'account-004',
    ownerId: 'owner-001',
    stage: 'contract',
    value: 120000,
    currency: 'USD',
    createdAt: getTimestamp(20),
    updatedAt: getTimestamp(0, 2), // Very recent
    closeDate: getTimestamp(-3),
    probability: 85,
    source: 'website',
    tags: ['enterprise', 'priority'],
  },
  {
    id: 'deal-005',
    accountId: 'account-005',
    ownerId: 'owner-002',
    stage: 'proposal',
    value: 30000,
    currency: 'USD',
    createdAt: getTimestamp(3),
    updatedAt: getTimestamp(3),
    closeDate: getTimestamp(-10),
    probability: 40,
    source: 'referral',
    tags: ['mid-market'],
  },
];

// ============================================================================
// Demo Shipments
// ============================================================================

export const shipments: Shipment[] = [
  {
    id: 'ship-001',
    dealId: 'deal-001',
    accountId: 'account-001',
    trackingNumber: 'TRK123456',
    origin: 'New York',
    destination: 'Los Angeles',
    serviceType: 'ground',
    weight: 1500,
    status: 'in-transit',
    createdAt: getTimestamp(10),
    updatedAt: getTimestamp(1),
    quoteRequestedAt: getTimestamp(10),
    // No quoteProvidedAt - should trigger quote SLA breach
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
    weight: 800,
    status: 'delayed',
    createdAt: getTimestamp(8),
    updatedAt: getTimestamp(1),
    quoteRequestedAt: getTimestamp(8),
    quoteProvidedAt: getTimestamp(7),
    bookingConfirmedAt: getTimestamp(6),
    pickedUpAt: getTimestamp(5),
    dwellDays: 5, // Exceeds SLA of 3 days
  },
  {
    id: 'ship-003',
    dealId: 'deal-003',
    accountId: 'account-003',
    trackingNumber: 'TRK345678',
    origin: 'Seattle',
    destination: 'Portland',
    serviceType: 'ground',
    weight: 300,
    status: 'delivered',
    createdAt: getTimestamp(12),
    updatedAt: getTimestamp(2),
    quoteRequestedAt: getTimestamp(12),
    quoteProvidedAt: getTimestamp(11),
    bookingConfirmedAt: getTimestamp(10),
    pickedUpAt: getTimestamp(9),
    deliveredAt: getTimestamp(3),
    // No podReceivedAt - should trigger POD latency
  },
  {
    id: 'ship-004',
    dealId: 'deal-004',
    accountId: 'account-004',
    trackingNumber: 'TRK901234',
    origin: 'Houston',
    destination: 'Dallas',
    serviceType: 'ground',
    weight: 2000,
    status: 'in-transit',
    createdAt: getTimestamp(5),
    updatedAt: getTimestamp(0, 1),
    quoteRequestedAt: getTimestamp(5),
    quoteProvidedAt: getTimestamp(4),
    bookingConfirmedAt: getTimestamp(3),
    pickedUpAt: getTimestamp(2),
    dwellDays: 1,
  },
  {
    id: 'ship-005',
    dealId: 'deal-005',
    accountId: 'account-005',
    trackingNumber: 'TRK567890',
    origin: 'Boston',
    destination: 'Atlanta',
    serviceType: 'air',
    weight: 600,
    status: 'problem',
    createdAt: getTimestamp(6),
    updatedAt: getTimestamp(1),
    quoteRequestedAt: getTimestamp(6),
    quoteProvidedAt: getTimestamp(5),
    // No bookingConfirmedAt - should trigger booking confirm delay
    dwellDays: 4, // Exceeds SLA
  },
];

// ============================================================================
// Demo Communications
// ============================================================================

export const comms: Communication[] = [
  {
    id: 'comm-001',
    entityId: 'deal-001',
    entityType: 'deal',
    channel: 'email',
    direction: 'inbound',
    participants: ['customer@acme.com', 'sales@company.com'],
    subject: 'Urgent Quote Request',
    content: 'We need a quote for our Q1 logistics contract urgently.',
    timestamp: getTimestamp(10),
    sentiment: 'positive',
    tags: ['quote-request', 'urgent'],
  },
  {
    id: 'comm-002',
    entityId: 'deal-001',
    entityType: 'deal',
    channel: 'email',
    direction: 'outbound',
    participants: ['customer@acme.com', 'sales@company.com'],
    subject: 'Re: Urgent Quote Request',
    content: 'Thank you for your inquiry. We will provide a quote within 24 hours.',
    timestamp: getTimestamp(9),
    sentiment: 'positive',
    tags: ['quote-response'],
  },
  {
    id: 'comm-003',
    entityId: 'deal-002',
    entityType: 'deal',
    channel: 'phone',
    direction: 'inbound',
    participants: ['customer2@techcorp.com', 'sales@company.com'],
    subject: 'Follow-up Call',
    content: 'Customer called about delayed shipment and is getting frustrated.',
    timestamp: getTimestamp(2),
    sentiment: 'negative',
    tags: ['complaint', 'delay'],
  },
  {
    id: 'comm-004',
    entityId: 'deal-003',
    entityType: 'deal',
    channel: 'email',
    direction: 'inbound',
    participants: ['customer3@smallbiz.com', 'sales@company.com'],
    subject: 'Initial Inquiry',
    content: 'We are interested in your freight services for our small business.',
    timestamp: getTimestamp(5), // Old communication - should trigger no reply
    sentiment: 'neutral',
    tags: ['inquiry'],
  },
  {
    id: 'comm-005',
    entityId: 'deal-004',
    entityType: 'deal',
    channel: 'email',
    direction: 'outbound',
    participants: ['customer4@enterprise.com', 'sales@company.com'],
    subject: 'Contract Signed',
    content: 'Great news! The contract has been signed and we are ready to proceed.',
    timestamp: getTimestamp(0, 2), // Very recent
    sentiment: 'positive',
    tags: ['contract-signed'],
  },
  {
    id: 'comm-006',
    entityId: 'deal-005',
    entityType: 'deal',
    channel: 'email',
    direction: 'inbound',
    participants: ['customer5@midmarket.com', 'sales@company.com'],
    subject: 'Quote Follow-up',
    content: 'We received your quote but have some questions about pricing.',
    timestamp: getTimestamp(3),
    sentiment: 'neutral',
    tags: ['quote-followup'],
  },
  {
    id: 'comm-007',
    entityId: 'ship-002',
    entityType: 'shipment',
    channel: 'email',
    direction: 'inbound',
    participants: ['customer2@techcorp.com', 'ops@company.com'],
    subject: 'Shipment Delay Concern',
    content: 'Our shipment has been delayed and we need an update on delivery.',
    timestamp: getTimestamp(1),
    sentiment: 'negative',
    tags: ['delay-complaint'],
  },
  {
    id: 'comm-008',
    entityId: 'ship-003',
    entityType: 'shipment',
    channel: 'phone',
    direction: 'outbound',
    participants: ['customer3@smallbiz.com', 'ops@company.com'],
    subject: 'Delivery Confirmation',
    content: 'Your shipment has been delivered. Please confirm receipt.',
    timestamp: getTimestamp(2),
    sentiment: 'positive',
    tags: ['delivery-confirmation'],
  },
];

// ============================================================================
// Account Tier Mapping
// ============================================================================

export const accountTiers: Record<string, 'A' | 'B' | 'C'> = {
  'account-001': 'A', // Enterprise
  'account-002': 'B', // Mid-market
  'account-003': 'C', // Small business
  'account-004': 'A', // Enterprise
  'account-005': 'B', // Mid-market
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets account tier for a given account ID
 */
export function getAccountTier(accountId: string): 'A' | 'B' | 'C' {
  return accountTiers[accountId] || 'C';
}

/**
 * Gets all demo data as a single object
 */
export function getDemoData() {
  return {
    deals,
    shipments,
    comms,
    accountTiers,
  };
}

/**
 * Filters demo data by scope and optional ID
 */
export function filterDemoData(scope: string, id?: string) {
  let filteredDeals = deals;
  let filteredShipments = shipments;
  let filteredComms = comms;

  if (id) {
    if (scope === 'deal') {
      filteredDeals = deals.filter(d => d.id === id);
      filteredShipments = shipments.filter(s => s.dealId === id);
      filteredComms = comms.filter(c => c.entityId === id);
    } else if (scope === 'account') {
      filteredDeals = deals.filter(d => d.accountId === id);
      filteredShipments = shipments.filter(s => s.accountId === id);
      filteredComms = comms.filter(c => c.entityId === id);
    }
  }

  return {
    deals: filteredDeals,
    shipments: filteredShipments,
    comms: filteredComms,
  };
}
