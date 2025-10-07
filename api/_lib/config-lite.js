// ============================================================================
// Edge-Compatible Configuration Library (Pure JavaScript)
// ============================================================================

/**
 * Default SLA configuration values for logistics operations.
 */
export const DEFAULT_SLA = {
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
};

// ============================================================================
// Configuration Utility Functions
// ============================================================================

/**
 * Merges a base SLA configuration with optional override values.
 * 
 * @param {Object} base - The base SLA configuration to merge from
 * @param {Object} override - Optional partial SLA configuration to override base values
 * @returns {Object} A new SLA configuration with merged values
 */
export function mergeSla(base, override) {
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
 * @param {number} breachSize - The magnitude of the SLA breach (normalized 0-1 scale)
 * @returns {string} Severity level: 'low', 'medium', or 'high'
 */
export function getSeverity(breachSize) {
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

/**
 * Creates a complete weights configuration by merging defaults with overrides.
 * 
 * @param {Object} overrides - Optional partial weights configuration
 * @returns {Object} Complete weights configuration
 */
export function createWeightsConfig(overrides) {
  return {
    ...DEFAULT_WEIGHTS,
    ...overrides,
  };
}

/**
 * Validates that SLA configuration values are within reasonable bounds.
 * 
 * @param {Object} sla - SLA configuration to validate
 * @returns {boolean} True if all values are within acceptable ranges
 */
export function validateSlaConfig(sla) {
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
 * @param {number} actual - Actual time/value
 * @param {number} sla - SLA threshold
 * @returns {number} Breach percentage (0-1 scale)
 */
export function calculateBreachPercentage(actual, sla) {
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
 * @param {string} severity - Severity level
 * @returns {number} Weight multiplier for the severity level
 */
export function getSeverityWeight(severity) {
  const weights = {
    low: 0.1,
    medium: 0.4,
    high: 0.7,
    critical: 1.0,
  };
  
  return weights[severity] || 0.1;
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
};

/**
 * Maximum breach percentage for scoring calculations.
 */
export const MAX_BREACH_PERCENTAGE = 1.0;

/**
 * Minimum breach percentage to trigger notifications.
 */
export const MIN_BREACH_THRESHOLD = 0.1;
