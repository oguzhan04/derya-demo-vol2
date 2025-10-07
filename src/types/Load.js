// Normalized Load Schema
// This represents the complete data structure for a logistics load

export const LoadStatus = {
  PLANNING: 'planning',
  IN_TRANSIT: 'in_transit', 
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const DocumentStatus = {
  PENDING: 'pending',
  PARTIAL: 'partial', 
  COMPLETED: 'completed',
  ACTIVE: 'active' // for tracking
};

export const TransportMode = {
  OCEAN: 'ocean',
  AIR: 'air',
  TRUCK: 'truck',
  RAIL: 'rail'
};

// Core Load Structure
export const LoadSchema = {
  // Basic Info
  id: 'string', // LOAD-2024-001
  route: {
    origin: 'string', // Shanghai
    destination: 'string', // Los Angeles  
    mode: 'string', // ocean/air/truck/rail
    distance: 'number', // nautical miles or km
    estimatedTransitDays: 'number'
  },
  
  // Cargo Details
  cargo: {
    type: 'string', // Electronics, Automotive Parts, etc.
    value: 'number', // USD
    weight: 'number', // kg
    volume: 'number', // CBM
    containers: 'number', // TEU count
    hazardous: 'boolean',
    temperatureControlled: 'boolean'
  },
  
  // Status & Timeline
  status: 'string', // planning/in_transit/delivered/cancelled
  createdAt: 'string', // ISO date
  updatedAt: 'string', // ISO date
  completion: 'number', // 0-100%
  
  // Documents (extracted JSON from each source)
  documents: {
    billOfLading: {
      status: 'string',
      files: 'array', // [{ id, filename, uploadedAt, extractedJson }]
      lastUpdated: 'string'
    },
    commercialInvoice: {
      status: 'string', 
      files: 'array',
      lastUpdated: 'string'
    },
    invoices: {
      status: 'string',
      files: 'array', 
      lastUpdated: 'string'
    },
    rateTable: {
      status: 'string',
      files: 'array',
      lastUpdated: 'string'
    },
    quotation: {
      status: 'string',
      files: 'array',
      lastUpdated: 'string'
    },
    booking: {
      status: 'string',
      files: 'array',
      lastUpdated: 'string'
    },
    tracking: {
      status: 'string',
      files: 'array',
      lastUpdated: 'string'
    }
  },
  
  // Analysis Results (computed from historical data)
  analysis: {
    riskScore: 'number', // 0-1
    predictedCost: 'number', // USD
    predictedTransitDays: 'number',
    similarLoads: 'array', // [{ id, similarity, outcome }]
    alerts: 'array', // [{ type, message, severity }]
    recommendations: 'array' // [{ type, message, impact }]
  }
};

// Document File Structure
export const DocumentFile = {
  id: 'string',
  filename: 'string', 
  uploadedAt: 'string',
  extractedJson: 'object', // LLM extracted data
  validationStatus: 'string', // valid/invalid/warning
  fileSize: 'number',
  mimeType: 'string'
};

// Extracted JSON Schemas for each document type
export const BillOfLadingSchema = {
  vessel: 'string',
  voyage: 'string', 
  shipper: 'string',
  consignee: 'string',
  notifyParty: 'string',
  portOfLoading: 'string',
  portOfDischarge: 'string',
  freightCharges: 'number',
  currency: 'string',
  containerNumbers: 'array',
  sealNumbers: 'array',
  cargoDescription: 'string',
  marksAndNumbers: 'string'
};

export const CommercialInvoiceSchema = {
  invoiceNumber: 'string',
  invoiceDate: 'string',
  seller: 'string',
  buyer: 'string',
  totalValue: 'number',
  currency: 'string',
  hsCodes: 'array',
  countryOfOrigin: 'string',
  termsOfSale: 'string',
  paymentTerms: 'string'
};

export const InvoiceSchema = {
  invoiceNumber: 'string',
  invoiceDate: 'string',
  vendor: 'string',
  totalAmount: 'number',
  currency: 'string',
  lineItems: 'array', // [{ description, amount, quantity }]
  dueDate: 'string',
  paymentStatus: 'string'
};

export const RateTableSchema = {
  lane: 'string', // origin-destination
  baseRate: 'number',
  currency: 'string',
  validFrom: 'string',
  validTo: 'string',
  surcharges: 'array', // [{ type, amount, description }]
  containerTypes: 'array' // [{ type, rate }]
};

export const QuotationSchema = {
  quoteNumber: 'string',
  quoteDate: 'string',
  customer: 'string',
  totalPrice: 'number',
  currency: 'string',
  validUntil: 'string',
  terms: 'string',
  winLoss: 'string', // won/lost/pending
  winLossDate: 'string'
};

export const BookingSchema = {
  bookingNumber: 'string',
  carrier: 'string',
  vessel: 'string',
  voyage: 'string',
  sailingDate: 'string',
  arrivalDate: 'string',
  containerType: 'string',
  containerNumbers: 'array',
  rate: 'number',
  currency: 'string'
};

export const TrackingSchema = {
  vesselName: 'string',
  imo: 'string',
  currentPosition: {
    lat: 'number',
    lng: 'number'
  },
  currentPort: 'string',
  eta: 'string',
  events: 'array' // [{ timestamp, event, location, status }]
};


