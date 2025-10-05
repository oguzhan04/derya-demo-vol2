import { SLAConfig, WeightsConfig } from './types.js';

// ============================================================================
// Default Configuration Values
// ============================================================================

/**
 * Default SLA configuration values as specified in the CX specification.
 * These represent the standard service level agreements for logistics operations.
 */
export const DEFAULT_SLA: SLAConfig = {
  quote_hours: 48,
  booking_confirm_hours: 24,
  dwell_days: 3,
  pod_hours: 48,
  no_reply_days: 7,
  owner_touch_hours: {
    pre: 72,
    post: 96,
  },
};

/**
 * Default weights configuration for CX scoring and prioritization.
 * Higher weights indicate more critical factors in the scoring algorithm.
 */
export const DEFAULT_WEIGHTS = {
  quote_sla: 3,      // Weight for quote turnaround time breaches
  dwell: 3,          // Weight for dwell time breaches
  exceptions: 2,     // Weight for recent exceptions count
  no_reply: 1,       // Weight for communication gaps
  sentiment: 1,      // Weight for negative sentiment
} as const;

// ============================================================================
// Configuration Utility Functions
// ============================================================================

/**
 * Merges a base SLA configuration with optional override values.
 * 
 * @param base - The base SLA configuration to merge from
 * @param override - Optional partial SLA configuration to override base values
 * @returns A new SLA configuration with merged values
 * 
 * @example
 * ```typescript
 * const customSla = mergeSla(DEFAULT_SLA, { quote_hours: 24 });
 * // Result: DEFAULT_SLA with quote_hours set to 24
 * ```
 */
export function mergeSla(base: SLAConfig, override?: Partial<SLAConfig>): SLAConfig {
  if (!override) {
    return { ...base };
  }

  return {
    ...base,
    ...override,
    owner_touch_hours: {
      ...base.owner_touch_hours,
      ...(override.owner_touch_hours || {}),
    },
  };
}

/**
 * Determines severity level based on breach size magnitude.
 * 
 * @param breachSize - The magnitude of the SLA breach (normalized 0-1 scale)
 * @returns Severity level: 'low', 'medium', or 'high'
 * 
 * @example
 * ```typescript
 * getSeverity(0.2);  // Returns 'low'
 * getSeverity(0.5);  // Returns 'medium' 
 * getSeverity(0.8);  // Returns 'high'
 * ```
 */
export function getSeverity(breachSize: number): 'low' | 'medium' | 'high' {
  // Ensure breachSize is within valid range
  const normalizedBreach = Math.max(0, Math.min(1, breachSize));
  
  if (normalizedBreach >= 0.7) {
    return 'high';
  } else if (normalizedBreach >= 0.3) {
    return 'medium';
  } else {
    return 'low';
  }
}

// ============================================================================
// Additional Configuration Utilities
// ============================================================================

/**
 * Creates a complete weights configuration by merging defaults with overrides.
 * 
 * @param overrides - Optional partial weights configuration
 * @returns Complete weights configuration
 */
export function createWeightsConfig(overrides?: Partial<typeof DEFAULT_WEIGHTS>): typeof DEFAULT_WEIGHTS {
  return {
    ...DEFAULT_WEIGHTS,
    ...overrides,
  };
}

/**
 * Validates that SLA configuration values are within reasonable bounds.
 * 
 * @param sla - SLA configuration to validate
 * @returns True if all values are within acceptable ranges
 */
export function validateSlaConfig(sla: SLAConfig): boolean {
  return (
    sla.quote_hours > 0 &&
    sla.booking_confirm_hours > 0 &&
    sla.dwell_days > 0 &&
    sla.pod_hours > 0 &&
    sla.no_reply_days > 0 &&
    sla.owner_touch_hours.pre > 0 &&
    sla.owner_touch_hours.post > 0
  );
}

/**
 * Calculates breach percentage for a given SLA metric.
 * 
 * @param actual - Actual time/value
 * @param sla - SLA threshold
 * @returns Breach percentage (0-1 scale)
 */
export function calculateBreachPercentage(actual: number, sla: number): number {
  if (actual <= sla) {
    return 0;
  }
  
  // Calculate percentage over SLA
  const breach = (actual - sla) / sla;
  
  // Cap at 100% breach for scoring purposes
  return Math.min(1, breach);
}

/**
 * Gets severity weight multiplier for prioritization calculations.
 * 
 * @param severity - Severity level
 * @returns Weight multiplier for the severity level
 */
export function getSeverityWeight(severity: 'low' | 'medium' | 'high' | 'critical'): number {
  const weights = {
    low: 0.1,
    medium: 0.4,
    high: 0.7,
    critical: 1.0,
  };
  
  return weights[severity];
}

// ============================================================================
// Configuration Constants
// ============================================================================

/**
 * Severity thresholds for different breach types.
 */
export const SEVERITY_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.7,
  HIGH: 1.0,
} as const;

/**
 * Maximum breach percentage for scoring calculations.
 */
export const MAX_BREACH_PERCENTAGE = 1.0;

/**
 * Minimum breach percentage to trigger notifications.
 */
export const MIN_BREACH_THRESHOLD = 0.1;
