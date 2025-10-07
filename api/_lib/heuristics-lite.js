// ============================================================================
// Edge-Compatible Heuristics Library (Pure JavaScript)
// ============================================================================

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculates the number of days between two ISO date strings.
 * 
 * @param {string} date1 - First date (ISO string)
 * @param {string} date2 - Second date (ISO string)
 * @returns {number} Number of days between dates
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Calculates the number of hours between two ISO date strings.
 * 
 * @param {string} date1 - First date (ISO string)
 * @param {string} date2 - Second date (ISO string)
 * @returns {number} Number of hours between dates
 */
function hoursBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60);
}

/**
 * Gets stage score for deal progression.
 * 
 * @param {string} stage - Deal stage
 * @returns {number} Stage score
 */
function getStageScore(stage) {
  const stageScores = {
    'lead': 5,
    'prospect': 10,
    'proposal': 20,
    'negotiation': 25,
    'contract': 30,
    'closed-won': 0, // Already won
    'closed-lost': -30, // Lost
  };
  return stageScores[stage.toLowerCase()] || 0;
}

/**
 * Calculates communication frequency score.
 * 
 * @param {Object[]} comms - Array of communications
 * @returns {number} Communication frequency score
 */
function calculateCommFrequency(comms) {
  if (comms.length === 0) return 0;
  
  const daysSinceStart = Math.max(1, daysBetween(comms[0]?.timestamp || new Date().toISOString(), new Date().toISOString()));
  const commsPerDay = comms.length / daysSinceStart;
  
  if (commsPerDay > 0.5) return 20; // High frequency
  if (commsPerDay > 0.2) return 10; // Medium frequency
  return 0; // Low frequency
}

/**
 * Calculates recent activity score.
 * 
 * @param {Object[]} comms - Array of communications
 * @returns {number} Recent activity score
 */
function calculateRecentActivity(comms) {
  if (comms.length === 0) return -15; // No activity
  
  const lastComm = comms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const daysSinceLastComm = daysBetween(lastComm.timestamp, new Date().toISOString());
  
  if (daysSinceLastComm <= 1) return 15; // Very recent
  if (daysSinceLastComm <= 3) return 10; // Recent
  if (daysSinceLastComm <= 7) return 5; // Somewhat recent
  return -10; // Stale
}

/**
 * Calculates sentiment score from communications.
 * 
 * @param {Object[]} comms - Array of communications
 * @returns {number} Sentiment score
 */
function calculateSentimentScore(comms) {
  if (comms.length === 0) return 0;
  
  const sentimentCounts = comms.reduce((acc, comm) => {
    const sentiment = comm.sentiment || 'neutral';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  const total = comms.length;
  const positiveRatio = (sentimentCounts.positive || 0) / total;
  const negativeRatio = (sentimentCounts.negative || 0) / total;
  
  return Math.round((positiveRatio - negativeRatio) * 15);
}

/**
 * Calculates timeline pressure score.
 * 
 * @param {Object} deal - Deal object
 * @returns {number} Timeline score
 */
function calculateTimelineScore(deal) {
  if (!deal.closeDate) return 0;
  
  const daysToClose = daysBetween(new Date().toISOString(), deal.closeDate);
  
  if (daysToClose <= 7) return 20; // Very urgent
  if (daysToClose <= 14) return 15; // Urgent
  if (daysToClose <= 30) return 10; // Somewhat urgent
  return 0; // Not urgent
}

// ============================================================================
// Core Scoring Functions
// ============================================================================

/**
 * Scores win likelihood based on deal progression and communication patterns.
 * 
 * @param {Object} deal - The deal to score
 * @param {Object[]} comms - Communications related to the deal
 * @param {Object} sla - SLA configuration (optional)
 * @returns {Object} Scoring result with score (0-100) and signals
 */
export function scoreWinLikelihood(deal, comms, sla) {
  const signals = [];
  let score = 50; // Start with neutral score

  // Filter communications for this deal
  const dealComms = comms.filter(c => c.entityId === deal.id && c.entityType === 'deal');
  
  // 1. Deal Stage Factor (0-30 points)
  const stageScore = getStageScore(deal.stage);
  score += stageScore;
  signals.push({
    key: 'deal_stage',
    label: `Deal stage: ${deal.stage}`,
    value: stageScore,
    weight: 0.3
  });

  // 2. Communication Frequency (0-20 points)
  const commFrequency = calculateCommFrequency(dealComms);
  score += commFrequency;
  signals.push({
    key: 'comm_frequency',
    label: `Communication frequency: ${commFrequency > 0 ? 'High' : 'Low'}`,
    value: commFrequency,
    weight: 0.2
  });

  // 3. Recent Activity (0-15 points)
  const recentActivity = calculateRecentActivity(dealComms);
  score += recentActivity;
  signals.push({
    key: 'recent_activity',
    label: `Recent activity: ${recentActivity > 0 ? 'Active' : 'Stale'}`,
    value: recentActivity,
    weight: 0.15
  });

  // 4. Sentiment Analysis (0-15 points)
  const sentimentScore = calculateSentimentScore(dealComms);
  score += sentimentScore;
  signals.push({
    key: 'sentiment',
    label: `Sentiment: ${sentimentScore > 0 ? 'Positive' : 'Negative'}`,
    value: sentimentScore,
    weight: 0.15
  });

  // 5. Timeline Pressure (0-20 points)
  const timelineScore = calculateTimelineScore(deal);
  score += timelineScore;
  signals.push({
    key: 'timeline',
    label: `Timeline pressure: ${timelineScore > 0 ? 'Urgent' : 'Normal'}`,
    value: timelineScore,
    weight: 0.2
  });

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return { score, signals };
}

/**
 * Scores customer experience risk based on operational and communication factors.
 * 
 * @param {Object} deal - The deal to score
 * @param {Object[]} shipments - Shipments related to the deal
 * @param {Object[]} comms - Communications related to the deal
 * @param {Object} sla - SLA configuration
 * @returns {Object} Scoring result with score (0-100) and signals
 */
export function scoreCxRisk(deal, shipments, comms, sla) {
  const signals = [];
  let score = 0; // Start with no risk

  // Filter related data
  const dealShipments = shipments.filter(s => s.dealId === deal.id);
  const dealComms = comms.filter(c => c.entityId === deal.id && c.entityType === 'deal');

  // 1. SLA Breaches (0-40 points)
  const slaBreaches = calculateSlaBreaches(dealShipments, sla);
  score += slaBreaches.score;
  signals.push(...slaBreaches.signals);

  // 2. Communication Gaps (0-25 points)
  const commGaps = calculateCommGaps(dealComms, sla);
  score += commGaps.score;
  signals.push(...commGaps.signals);

  // 3. Exception Patterns (0-20 points)
  const exceptions = calculateExceptionPatterns(dealShipments);
  score += exceptions.score;
  signals.push(...exceptions.signals);

  // 4. Sentiment Decline (0-15 points)
  const sentimentDecline = calculateSentimentDecline(dealComms);
  score += sentimentDecline.score;
  signals.push(...sentimentDecline.signals);

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return { score, signals };
}

// ============================================================================
// Helper Functions for CX Risk Scoring
// ============================================================================

/**
 * Calculates SLA breach scores and signals.
 * 
 * @param {Object[]} shipments - Array of shipments
 * @param {Object} sla - SLA configuration
 * @returns {Object} Score and signals for SLA breaches
 */
function calculateSlaBreaches(shipments, sla) {
  let score = 0;
  const signals = [];
  
  for (const shipment of shipments) {
    // Quote response time breach
    if (shipment.quoteRequestedAt && shipment.quoteProvidedAt) {
      const hoursToQuote = hoursBetween(shipment.quoteRequestedAt, shipment.quoteProvidedAt);
      if (hoursToQuote > sla.quote_hours) {
        const breachPercentage = (hoursToQuote - sla.quote_hours) / sla.quote_hours;
        score += Math.min(20, breachPercentage * 20);
        signals.push({
          key: 'quote_sla_breach',
          label: `Quote SLA breach: ${hoursToQuote.toFixed(1)}h (SLA: ${sla.quote_hours}h)`,
          value: breachPercentage,
          weight: 0.4
        });
      }
    }
    
    // Dwell time breach
    if (shipment.dwellDays && shipment.dwellDays > sla.dwell_days) {
      const breachPercentage = (shipment.dwellDays - sla.dwell_days) / sla.dwell_days;
      score += Math.min(20, breachPercentage * 20);
      signals.push({
        key: 'dwell_breach',
        label: `Dwell time breach: ${shipment.dwellDays} days (SLA: ${sla.dwell_days} days)`,
        value: breachPercentage,
        weight: 0.4
      });
    }
  }
  
  return { score, signals };
}

/**
 * Calculates communication gap scores and signals.
 * 
 * @param {Object[]} comms - Array of communications
 * @param {Object} sla - SLA configuration
 * @returns {Object} Score and signals for communication gaps
 */
function calculateCommGaps(comms, sla) {
  let score = 0;
  const signals = [];
  
  if (comms.length === 0) {
    score += 25; // No communications at all
    signals.push({
      key: 'no_communications',
      label: 'No communications found',
      value: 1,
      weight: 0.25
    });
    return { score, signals };
  }
  
  // Check for gaps longer than SLA
  const sortedComms = comms.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  for (let i = 1; i < sortedComms.length; i++) {
    const gapDays = daysBetween(sortedComms[i-1].timestamp, sortedComms[i].timestamp);
    if (gapDays > sla.no_reply_days) {
      const breachPercentage = gapDays / sla.no_reply_days;
      score += Math.min(15, breachPercentage * 5);
      signals.push({
        key: 'comm_gap',
        label: `Communication gap: ${gapDays.toFixed(1)} days`,
        value: breachPercentage,
        weight: 0.15
      });
    }
  }
  
  return { score, signals };
}

/**
 * Calculates exception pattern scores and signals.
 * 
 * @param {Object[]} shipments - Array of shipments
 * @returns {Object} Score and signals for exception patterns
 */
function calculateExceptionPatterns(shipments) {
  let score = 0;
  const signals = [];
  
  const exceptionCount = shipments.filter(s => s.status === 'delayed' || s.status === 'exception').length;
  
  if (exceptionCount > 0) {
    const exceptionRate = exceptionCount / shipments.length;
    score += Math.min(20, exceptionRate * 20);
    signals.push({
      key: 'exception_pattern',
      label: `Exception rate: ${(exceptionRate * 100).toFixed(1)}%`,
      value: exceptionRate,
      weight: 0.2
    });
  }
  
  return { score, signals };
}

/**
 * Calculates sentiment decline scores and signals.
 * 
 * @param {Object[]} comms - Array of communications
 * @returns {Object} Score and signals for sentiment decline
 */
function calculateSentimentDecline(comms) {
  let score = 0;
  const signals = [];
  
  if (comms.length < 3) return { score, signals };
  
  // Calculate rolling sentiment average
  const sortedComms = comms.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const recentComms = sortedComms.slice(-5); // Last 5 communications
  
  const sentimentValues = recentComms.map(c => {
    switch (c.sentiment) {
      case 'positive': return 1;
      case 'negative': return -1;
      default: return 0;
    }
  });
  
  const avgSentiment = sentimentValues.reduce<number>((sum, val) => sum + val, 0) / sentimentValues.length;
  
  if (avgSentiment < -0.4) {
    score = 15;
    signals.push({
      key: 'negative_sentiment',
      label: `Negative sentiment trend: ${avgSentiment.toFixed(2)}`,
      value: avgSentiment,
      weight: 0.15
    });
  }
  
  return { score, signals };
}

// ============================================================================
// Notification Generation
// ============================================================================

/**
 * Derives notifications from deals, shipments, and communications based on CX rules.
 * 
 * @param {Object} input - Object containing deals, shipments, comms, and optional SLA config
 * @returns {Object[]} Array of notifications for CX issues
 */
export function deriveNotifications(input) {
  const { deals, shipments, comms, sla } = input;
  const notifications = [];
  const now = new Date().toISOString();

  for (const deal of deals) {
    const dealShipments = shipments.filter(s => s.dealId === deal.id);
    const dealComms = comms.filter(c => c.entityId === deal.id);

    // 1. Quote SLA Breach
    const quoteBreach = checkQuoteSlaBreach(deal, dealShipments, sla, now);
    if (quoteBreach) notifications.push(quoteBreach);

    // 2. Owner Idle
    const ownerIdle = checkOwnerIdle(deal, dealComms, sla, now);
    if (ownerIdle) notifications.push(ownerIdle);

    // 3. No Reply
    const noReply = checkNoReply(deal, dealComms, sla, now);
    if (noReply) notifications.push(noReply);

    // 4. Booking Confirm Delayed
    const bookingDelay = checkBookingConfirmDelay(dealShipments, sla, now);
    if (bookingDelay) notifications.push(bookingDelay);

    // 5. Dwell Exceeded
    const dwellExceeded = checkDwellExceeded(dealShipments, sla, now);
    if (dwellExceeded) notifications.push(dwellExceeded);

    // 6. POD Latency
    const podLatency = checkPodLatency(dealShipments, sla, now);
    if (podLatency) notifications.push(podLatency);

    // 7. Exception Streak
    const exceptionStreak = checkExceptionStreak(dealShipments);
    if (exceptionStreak) notifications.push(exceptionStreak);

    // 8. Sentiment Decline
    const sentimentDecline = checkSentimentDecline(dealComms);
    if (sentimentDecline) notifications.push(sentimentDecline);
  }

  return notifications;
}

// ============================================================================
// Notification Check Functions
// ============================================================================

function checkQuoteSlaBreach(deal, shipments, sla, now) {
  for (const shipment of shipments) {
    if (shipment.quoteRequestedAt && !shipment.quoteProvidedAt) {
      const hoursSinceRequest = hoursBetween(shipment.quoteRequestedAt, now);
      if (hoursSinceRequest > sla.quote_hours) {
        return {
          id: `quote-breach-${deal.id}`,
          type: 'quote_sla_breach',
          severity: 'high',
          entity: { kind: 'deal', id: deal.id, name: `Deal ${deal.id}` },
          message: `Quote SLA breach: ${hoursSinceRequest.toFixed(1)}h since request`,
          time: now,
          metadata: {
            hoursOverSla: hoursSinceRequest - sla.quote_hours,
            slaThreshold: sla.quote_hours
          }
        };
      }
    }
  }
  return null;
}

function checkOwnerIdle(deal, comms, sla, now) {
  if (comms.length === 0) return null;
  
  const lastComm = comms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const hoursSinceLastComm = hoursBetween(lastComm.timestamp, now);
  
  if (hoursSinceLastComm > sla.owner_touch_hours.post) {
    return {
      id: `owner-idle-${deal.id}`,
      type: 'owner_idle',
      severity: 'medium',
      entity: { kind: 'deal', id: deal.id, name: `Deal ${deal.id}` },
      message: `Owner idle: ${hoursSinceLastComm.toFixed(1)}h since last touch`,
      time: now,
      metadata: {
        hoursIdle: hoursSinceLastComm,
        slaThreshold: sla.owner_touch_hours.post
      }
    };
  }
  return null;
}

function checkNoReply(deal, comms, sla, now) {
  const inboundComms = comms.filter(c => c.direction === 'inbound');
  if (inboundComms.length === 0) return null;
  
  const lastInbound = inboundComms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const daysSinceInbound = daysBetween(lastInbound.timestamp, now);
  
  if (daysSinceInbound > sla.no_reply_days) {
    return {
      id: `no-reply-${deal.id}`,
      type: 'no_reply',
      severity: 'medium',
      entity: { kind: 'deal', id: deal.id, name: `Deal ${deal.id}` },
      message: `No reply: ${daysSinceInbound.toFixed(1)} days since last inbound`,
      time: now,
      metadata: {
        daysSinceReply: daysSinceInbound,
        slaThreshold: sla.no_reply_days
      }
    };
  }
  return null;
}

function checkBookingConfirmDelay(shipments, sla, now) {
  for (const shipment of shipments) {
    if (shipment.quoteProvidedAt && !shipment.bookingConfirmedAt) {
      const hoursSinceQuote = hoursBetween(shipment.quoteProvidedAt, now);
      if (hoursSinceQuote > sla.booking_confirm_hours) {
        return {
          id: `booking-delay-${shipment.id}`,
          type: 'booking_confirm_delay',
          severity: 'medium',
          entity: { kind: 'shipment', id: shipment.id, name: `Shipment ${shipment.id}` },
          message: `Booking confirmation delay: ${hoursSinceQuote.toFixed(1)}h since quote`,
          time: now,
          metadata: {
            hoursSinceQuote,
            slaThreshold: sla.booking_confirm_hours
          }
        };
      }
    }
  }
  return null;
}

function checkDwellExceeded(shipments, sla, now) {
  for (const shipment of shipments) {
    if (shipment.dwellDays && shipment.dwellDays > sla.dwell_days) {
      return {
        id: `dwell-exceeded-${shipment.id}`,
        type: 'dwell_exceeded',
        severity: 'high',
        entity: { kind: 'shipment', id: shipment.id, name: `Shipment ${shipment.id}` },
        message: `Dwell time exceeded: ${shipment.dwellDays} days (SLA: ${sla.dwell_days} days)`,
        time: now,
        metadata: {
          dwellDays: shipment.dwellDays,
          slaThreshold: sla.dwell_days
        }
      };
    }
  }
  return null;
}

function checkPodLatency(shipments, sla, now) {
  for (const shipment of shipments) {
    if (shipment.deliveredAt && !shipment.podReceivedAt) {
      const hoursSinceDelivery = hoursBetween(shipment.deliveredAt, now);
      if (hoursSinceDelivery > sla.pod_hours) {
        return {
          id: `pod-latency-${shipment.id}`,
          type: 'pod_latency',
          severity: 'medium',
          entity: { kind: 'shipment', id: shipment.id, name: `Shipment ${shipment.id}` },
          message: `POD latency: ${hoursSinceDelivery.toFixed(1)}h since delivery`,
          time: now,
          metadata: {
            hoursSinceDelivery,
            slaThreshold: sla.pod_hours
          }
        };
      }
    }
  }
  return null;
}

function checkExceptionStreak(shipments) {
  const recentShipments = shipments.filter(s => {
    const daysSinceCreated = daysBetween(s.createdAt, new Date().toISOString());
    return daysSinceCreated <= 30; // Last 30 days
  });
  
  const exceptionCount = recentShipments.filter(s => s.status === 'delayed' || s.status === 'exception').length;
  
  if (exceptionCount >= 3) {
    return {
      id: `exception-streak-${recentShipments[0]?.dealId}`,
      type: 'exception_streak',
      severity: 'high',
      entity: { kind: 'deal', id: recentShipments[0]?.dealId, name: `Deal ${recentShipments[0]?.dealId}` },
      message: `Exception streak: ${exceptionCount} exceptions in last 30 days`,
      time: new Date().toISOString(),
      metadata: {
        exceptionCount,
        timeWindow: 30
      }
    };
  }
  return null;
}
