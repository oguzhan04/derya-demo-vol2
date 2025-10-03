// Shipment data types (JavaScript version)

// Example shipment object - JavaScript doesn't have types, this is documentation
/*
export type Shipment = {
  id?: string;
  mode?: 'Ocean' | 'Air' | 'Road' | 'Rail' | string;
  carrier?: string;
  origin?: string;
  destination?: string;
  departDate?: string;       // ISO or parseable
  promisedDate?: string;     // ETA / SLA
  arrivalDate?: string;      // actual
  distanceKm?: number;
  weightKg?: number;
  costUsd?: number;
  lane?: string;             // e.g., "CN->DE"
  riskLevel?: 'Low'|'Med'|'High'|string;
  containerType?: string;
  incoterms?: string;
  commodity?: string;
  sku?: string;
  lastUpdated?: string;
  status?: 'In Transit' | 'Delivered' | 'Late' | 'Cancelled' | string;
}
*/

// For JavaScript, we'll just export example objects as documentation
export const SHIPMENT_EXAMPLE = {
  id: 'SH-001',
  mode: 'Air',
  carrier: 'Global Express',
  origin: 'Shanghai',
  destination: 'Frankfurt',
  departDate: '2024-01-15T10:00:00Z',
  promisedDate: '2024-01-16T14:00:00Z',
  arrivalDate: '2024-01-17T16:30:00Z',
  distanceKm: 8500,
  weightKg: 1200,
  costUsd: 8500,
  lane: 'CN->DE',
  riskLevel: 'Low',
  commodity: 'Electronics',
};