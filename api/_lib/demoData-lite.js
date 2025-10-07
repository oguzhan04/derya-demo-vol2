// ============================================================================
// Edge-Compatible Demo Data Library (Pure JavaScript)
// ============================================================================

/**
 * Generates timestamps relative to now for realistic demo data
 */
function getTimestamp(daysAgo, hoursAgo = 0) {
  const now = new Date();
  const timestamp = new Date(now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);
  return timestamp.toISOString();
}

// ============================================================================
// Demo Deals
// ============================================================================

export const deals = [
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

export const shipments = [
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
    origin: 'Boston',
    destination: 'San Francisco',
    serviceType: 'air',
    weight: 1200,
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
    origin: 'Denver',
    destination: 'Atlanta',
    serviceType: 'ground',
    weight: 600,
    status: 'exception',
    createdAt: getTimestamp(7),
    updatedAt: getTimestamp(1),
    quoteRequestedAt: getTimestamp(7),
    quoteProvidedAt: getTimestamp(6),
    bookingConfirmedAt: getTimestamp(5),
    pickedUpAt: getTimestamp(4),
    dwellDays: 4, // Exceeds SLA
  },
];

// ============================================================================
// Demo Communications
// ============================================================================

export const comms = [
  {
    id: 'comm-001',
    entityId: 'deal-001',
    entityType: 'deal',
    channel: 'email',
    direction: 'inbound',
    participants: ['customer@example.com', 'sales@company.com'],
    subject: 'Quote Request',
    content: 'We need a quote for our upcoming shipment.',
    timestamp: getTimestamp(10),
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
    timestamp: getTimestamp(8),
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
    timestamp: getTimestamp(1),
    sentiment: 'negative',
    tags: ['complaint'],
  },
  {
    id: 'comm-004',
    entityId: 'deal-003',
    entityType: 'deal',
    channel: 'email',
    direction: 'inbound',
    participants: ['customer3@example.com', 'sales@company.com'],
    subject: 'Initial Inquiry',
    content: 'We are interested in your freight services.',
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
    participants: ['customer4@example.com', 'sales@company.com'],
    subject: 'Contract Update',
    content: 'Contract has been updated and is ready for signature.',
    timestamp: getTimestamp(0, 2), // Very recent
    sentiment: 'positive',
    tags: ['contract'],
  },
  {
    id: 'comm-006',
    entityId: 'deal-005',
    entityType: 'deal',
    channel: 'phone',
    direction: 'inbound',
    participants: ['customer5@example.com', 'sales@company.com'],
    subject: 'Service Issue',
    content: 'Customer reported service issues with their shipment.',
    timestamp: getTimestamp(2),
    sentiment: 'negative',
    tags: ['service-issue'],
  },
];

// ============================================================================
// Demo Data Filtering Functions
// ============================================================================

/**
 * Filters demo data based on scope and optional ID.
 * 
 * @param {string} scope - The scope to filter by ('deal', 'account', etc.)
 * @param {string} id - Optional ID to filter by
 * @returns {Object} Filtered demo data
 */
export function filterDemoData(scope, id) {
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

/**
 * Gets a subset of demo data for testing purposes.
 * 
 * @param {number} limit - Maximum number of items to return
 * @returns {Object} Limited demo data
 */
export function getLimitedDemoData(limit = 3) {
  return {
    deals: deals.slice(0, limit),
    shipments: shipments.slice(0, limit),
    comms: comms.slice(0, limit),
  };
}
