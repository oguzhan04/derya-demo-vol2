import { z } from 'zod';

// ============================================================================
// Entity Types & Schemas
// ============================================================================

// Deal Schema
export const DealSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  ownerId: z.string(),
  stage: z.string(),
  value: z.number(),
  currency: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  closeDate: z.string().datetime().optional(),
  probability: z.number().min(0).max(100),
  source: z.string(),
  tags: z.array(z.string()),
  customFields: z.record(z.any()).optional(),
});

export type Deal = z.infer<typeof DealSchema>;

// Shipment Schema
export const ShipmentSchema = z.object({
  id: z.string(),
  dealId: z.string().optional(),
  accountId: z.string(),
  trackingNumber: z.string(),
  origin: z.string(),
  destination: z.string(),
  serviceType: z.string(),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  status: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  quoteRequestedAt: z.string().datetime().optional(),
  quoteProvidedAt: z.string().datetime().optional(),
  bookingConfirmedAt: z.string().datetime().optional(),
  pickedUpAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  podReceivedAt: z.string().datetime().optional(),
  dwellDays: z.number().optional(),
  customFields: z.record(z.any()).optional(),
});

export type Shipment = z.infer<typeof ShipmentSchema>;

// Communication Schema
export const CommunicationSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  entityType: z.enum(['deal', 'shipment', 'account']),
  channel: z.enum(['email', 'phone', 'chat', 'meeting']),
  direction: z.enum(['inbound', 'outbound']),
  participants: z.array(z.string()),
  subject: z.string().optional(),
  content: z.string(),
  timestamp: z.string().datetime(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

export type Communication = z.infer<typeof CommunicationSchema>;

// ContractDoc Schema
export const ContractDocSchema = z.object({
  id: z.string(),
  dealId: z.string().optional(),
  accountId: z.string(),
  type: z.enum(['contract', 'quote', 'invoice', 'pod']),
  status: z.enum(['draft', 'sent', 'signed', 'rejected']),
  version: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  sentAt: z.string().datetime().optional(),
  signedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  fileUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type ContractDoc = z.infer<typeof ContractDocSchema>;

// ============================================================================
// CX Module Types & Schemas
// ============================================================================

// Entity Reference Schema
export const EntityRefSchema = z.object({
  kind: z.enum(['deal', 'account', 'shipment']),
  id: z.string(),
  name: z.string().optional(),
});

export type EntityRef = z.infer<typeof EntityRefSchema>;

// Evidence Schema
export const EvidenceSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  timestamp: z.string().datetime(),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

// Link Schema
export const LinkSchema = z.object({
  label: z.string(),
  ref: z.string(),
});

export type Link = z.infer<typeof LinkSchema>;

// Score Bundle Schema
export const ScoreBundleSchema = z.object({
  cxRisk: z.number().min(0).max(100).optional(),
  winLikelihood: z.number().min(0).max(100).optional(),
  marginRisk: z.number().min(0).max(100).optional(),
});

export type ScoreBundle = z.infer<typeof ScoreBundleSchema>;

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string(),
  time: z.string().datetime(),
  type: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  entity: EntityRefSchema,
  score: ScoreBundleSchema,
  evidence: z.array(EvidenceSchema),
  recommendation: z.string(),
  links: z.array(LinkSchema),
});

export type Notification = z.infer<typeof NotificationSchema>;

// SLA Configuration Schema
export const SLAConfigSchema = z.object({
  quote_hours: z.number().default(48),
  booking_confirm_hours: z.number().default(24),
  dwell_days: z.number().default(3),
  pod_hours: z.number().default(48),
  no_reply_days: z.number().default(7),
  owner_touch_hours: z.object({
    pre: z.number().default(72),
    post: z.number().default(96),
  }),
});

export type SLAConfig = z.infer<typeof SLAConfigSchema>;

// Weights Configuration Schema
export const WeightsConfigSchema = z.object({
  severity_weight: z.record(z.number()),
  exceptions_weight: z.number().default(0.3),
  account_tier_weight: z.number().default(0.1),
});

export type WeightsConfig = z.infer<typeof WeightsConfigSchema>;

// ============================================================================
// API Request/Response Types & Schemas
// ============================================================================

// POST /api/cx/ingest
export const IngestRequestSchema = z.object({
  source: z.enum(['upload', 'integration', 'existing']),
  payload: z.any().optional(),
  options: z.object({
    indexDocs: z.boolean().optional(),
  }).optional(),
});

export const IngestResponseSchema = z.object({
  ok: z.boolean(),
  imported: z.object({
    deals: z.number(),
    shipments: z.number(),
    comms: z.number(),
    docs: z.number(),
  }),
});

export type IngestRequest = z.infer<typeof IngestRequestSchema>;
export type IngestResponse = z.infer<typeof IngestResponseSchema>;

// Signal Schema for scoring
export const SignalSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.any(),
  weight: z.number(),
});

export type Signal = z.infer<typeof SignalSchema>;

// Score Result Schema
export const ScoreResultSchema = z.object({
  entity: EntityRefSchema,
  winLikelihood: z.number().min(0).max(100).optional(),
  cxRisk: z.number().min(0).max(100).optional(),
  marginRisk: z.number().min(0).max(100).optional(),
  signals: z.array(SignalSchema),
});

export type ScoreResult = z.infer<typeof ScoreResultSchema>;

// POST /api/cx/score
export const ScoreRequestSchema = z.object({
  scope: z.enum(['all', 'deal', 'account']),
  id: z.string().optional(),
});

export const ScoreResponseSchema = z.object({
  scores: z.array(ScoreResultSchema),
});

export type ScoreRequest = z.infer<typeof ScoreRequestSchema>;
export type ScoreResponse = z.infer<typeof ScoreResponseSchema>;

// POST /api/cx/notify
export const NotifyRequestSchema = z.object({
  scope: z.enum(['all', 'deal', 'account']),
  sla: SLAConfigSchema.partial().optional(),
});

export const NotifyResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
});

export type NotifyRequest = z.infer<typeof NotifyRequestSchema>;
export type NotifyResponse = z.infer<typeof NotifyResponseSchema>;

// Action Schema for briefs
export const ActionSchema = z.object({
  action: z.string(),
  confidence: z.number().min(0).max(100),
  rationale: z.string(),
});

export type Action = z.infer<typeof ActionSchema>;

// Source Schema for briefs
export const SourceSchema = z.object({
  label: z.string(),
  ref: z.string(),
});

export type Source = z.infer<typeof SourceSchema>;

// POST /api/cx/brief
export const BriefRequestSchema = z.object({
  entity: z.object({
    kind: z.enum(['deal', 'account', 'shipment']),
    id: z.string(),
  }),
  include: z.object({
    context: z.boolean().optional(),
    actions: z.boolean().optional(),
  }).optional(),
});

export const BriefResponseSchema = z.object({
  summary_md: z.string(),
  actions: z.array(ActionSchema),
  sources: z.array(SourceSchema).optional(),
});

export type BriefRequest = z.infer<typeof BriefRequestSchema>;
export type BriefResponse = z.infer<typeof BriefResponseSchema>;

// ============================================================================
// Utility Types
// ============================================================================

// Entity Union Type
export type Entity = Deal | Shipment | Communication | ContractDoc;

// Entity Type Discriminator
export type EntityType = 'deal' | 'shipment' | 'communication' | 'contractdoc';

// Severity Levels
export type Severity = 'low' | 'medium' | 'high' | 'critical';

// Channel Types
export type Channel = 'email' | 'phone' | 'chat' | 'meeting';

// Direction Types
export type Direction = 'inbound' | 'outbound';

// Document Types
export type DocumentType = 'contract' | 'quote' | 'invoice' | 'pod';

// Document Status
export type DocumentStatus = 'draft' | 'sent' | 'signed' | 'rejected';

// Sentiment Types
export type Sentiment = 'positive' | 'neutral' | 'negative';

// ============================================================================
// Schema Exports for Runtime Validation
// ============================================================================

export const schemas = {
  // Entity Schemas
  Deal: DealSchema,
  Shipment: ShipmentSchema,
  Communication: CommunicationSchema,
  ContractDoc: ContractDocSchema,
  
  // CX Module Schemas
  EntityRef: EntityRefSchema,
  Evidence: EvidenceSchema,
  Link: LinkSchema,
  ScoreBundle: ScoreBundleSchema,
  Notification: NotificationSchema,
  SLAConfig: SLAConfigSchema,
  WeightsConfig: WeightsConfigSchema,
  
  // API Schemas
  IngestRequest: IngestRequestSchema,
  IngestResponse: IngestResponseSchema,
  ScoreRequest: ScoreRequestSchema,
  ScoreResponse: ScoreResponseSchema,
  NotifyRequest: NotifyRequestSchema,
  NotifyResponse: NotifyResponseSchema,
  BriefRequest: BriefRequestSchema,
  BriefResponse: BriefResponseSchema,
  
  // Utility Schemas
  Signal: SignalSchema,
  ScoreResult: ScoreResultSchema,
  Action: ActionSchema,
  Source: SourceSchema,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

export function isDeal(entity: Entity): entity is Deal {
  return DealSchema.safeParse(entity).success;
}

export function isShipment(entity: Entity): entity is Shipment {
  return ShipmentSchema.safeParse(entity).success;
}

export function isCommunication(entity: Entity): entity is Communication {
  return CommunicationSchema.safeParse(entity).success;
}

export function isContractDoc(entity: Entity): entity is ContractDoc {
  return ContractDocSchema.safeParse(entity).success;
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateEntity<T extends Entity>(
  entity: unknown,
  schema: z.ZodSchema<T>
): T {
  return schema.parse(entity);
}

export function validateApiRequest<T>(
  request: unknown,
  schema: z.ZodSchema<T>
): T {
  return schema.parse(request);
}

export function validateApiResponse<T>(
  response: unknown,
  schema: z.ZodSchema<T>
): T {
  return schema.parse(response);
}
