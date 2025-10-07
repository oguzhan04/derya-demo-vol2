import { 
  Deal, 
  Shipment, 
  Communication, 
  Notification, 
  Signal, 
  SLAConfig,
  EntityRef,
  Evidence,
  Link
} from './types.js';
import { DEFAULT_SLA, DEFAULT_WEIGHTS, getSeverity, calculateBreachPercentage, getSeverityWeight } from './config.js';
import { getAccountTier } from './demoData.js';

// ============================================================================
// Types for Scoring Results
// ============================================================================

export interface ScoringResult {
  score: number;
  signals: Signal[];
}

export interface NotificationInput {
  deals: Deal[];
  shipments: Shipment[];
  comms: Communication[];
  sla?: SLAConfig;
}

// ============================================================================
// Win Likelihood Scoring
// ============================================================================

/**
 * Scores the likelihood of winning a deal based on engagement and timeline factors.
 * 
 * @param deal - The deal to score
 * @param comms - Communications related to the deal
 * @param sla - SLA configuration for timing calculations
 * @returns Scoring result with score (0-100) and contributing signals
 */
export function scoreWinLikelihood(
  deal: Deal, 
  comms: Communication[], 
  sla: SLAConfig = DEFAULT_SLA
): ScoringResult {
  const signals: Signal[] = [];
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
  const recentActivity = calculateRecentActivity(dealComms, sla);
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

// ============================================================================
// CX Risk Scoring
// ============================================================================

/**
 * Scores customer experience risk based on operational and communication factors.
 * 
 * @param deal - The deal to score
 * @param shipments - Shipments related to the deal
 * @param comms - Communications related to the deal
 * @param sla - SLA configuration for timing calculations
 * @returns Scoring result with score (0-100) and contributing signals
 */
export function scoreCxRisk(
  deal: Deal,
  shipments: Shipment[],
  comms: Communication[],
  sla: SLAConfig = DEFAULT_SLA
): ScoringResult {
  const signals: Signal[] = [];
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
// Notification Generation
// ============================================================================

/**
 * Derives notifications from deals, shipments, and communications based on CX rules.
 * 
 * @param input - Object containing deals, shipments, comms, and optional SLA config
 * @returns Array of notifications for CX issues
 */
export function deriveNotifications(input: NotificationInput): Notification[] {
  const { deals, shipments, comms, sla = DEFAULT_SLA } = input;
  const notifications: Notification[] = [];
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

  // Deduplicate notifications and compute priorities
  const deduplicatedNotifications = dedupeNotifications(notifications);
  
  // Add priority scores to notifications
  const notificationsWithPriority = deduplicatedNotifications.map(notif => {
    const accountTier = getAccountTier(notif.entity.id);
    const priority = computePriority(notif, DEFAULT_WEIGHTS, accountTier);
    return {
      ...notif,
      priority
    };
  });

  // Sort by priority (highest first)
  return notificationsWithPriority.sort((a, b) => (b as any).priority - (a as any).priority);
}

// ============================================================================
// Helper Functions for Scoring
// ============================================================================

function getStageScore(stage: string): number {
  const stageScores: Record<string, number> = {
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

function calculateCommFrequency(comms: Communication[]): number {
  const daysSinceStart = Math.max(1, daysBetween(comms[0]?.timestamp || new Date().toISOString(), new Date().toISOString()));
  const commsPerDay = comms.length / daysSinceStart;
  
  if (commsPerDay > 0.5) return 20; // High frequency
  if (commsPerDay > 0.2) return 10; // Medium frequency
  return 0; // Low frequency
}

function calculateRecentActivity(comms: Communication[], _sla: SLAConfig): number {
  if (comms.length === 0) return -15; // No activity
  
  const lastComm = comms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const daysSinceLastComm = daysBetween(lastComm.timestamp, new Date().toISOString());
  
  if (daysSinceLastComm <= 1) return 15; // Very recent
  if (daysSinceLastComm <= 3) return 10; // Recent
  if (daysSinceLastComm <= 7) return 5; // Somewhat recent
  return -10; // Stale
}

function calculateSentimentScore(comms: Communication[]): number {
  if (comms.length === 0) return 0;
  
  const sentimentCounts = comms.reduce((acc, comm) => {
    const sentiment = comm.sentiment || 'neutral';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const total = comms.length;
  const positiveRatio = (sentimentCounts.positive || 0) / total;
  const negativeRatio = (sentimentCounts.negative || 0) / total;
  
  return Math.round((positiveRatio - negativeRatio) * 15);
}

function calculateTimelineScore(deal: Deal): number {
  if (!deal.closeDate) return 0;
  
  const daysToClose = daysBetween(new Date().toISOString(), deal.closeDate);
  
  if (daysToClose <= 7) return 20; // Very urgent
  if (daysToClose <= 14) return 15; // Urgent
  if (daysToClose <= 30) return 10; // Somewhat urgent
  return 0; // Not urgent
}

function calculateSlaBreaches(shipments: Shipment[], sla: SLAConfig): { score: number; signals: Signal[] } {
  let score = 0;
  const signals: Signal[] = [];
  
  for (const shipment of shipments) {
    // Quote turnaround breach
    if (shipment.quoteRequestedAt && !shipment.quoteProvidedAt) {
      const hoursSinceRequest = hoursBetween(shipment.quoteRequestedAt, new Date().toISOString());
      if (hoursSinceRequest > sla.quote_hours) {
        const breachPct = calculateBreachPercentage(hoursSinceRequest, sla.quote_hours);
        score += Math.min(40, breachPct * 40);
        signals.push({
          key: 'quote_breach',
          label: `Quote SLA breach: ${hoursSinceRequest}h vs ${sla.quote_hours}h`,
          value: breachPct,
          weight: 0.4
        });
      }
    }
    
    // Dwell time breach
    if (shipment.dwellDays && shipment.dwellDays > sla.dwell_days) {
      const breachPct = calculateBreachPercentage(shipment.dwellDays, sla.dwell_days);
      score += Math.min(30, breachPct * 30);
      signals.push({
        key: 'dwell_breach',
        label: `Dwell time breach: ${shipment.dwellDays} days vs ${sla.dwell_days} days`,
        value: breachPct,
        weight: 0.3
      });
    }
  }
  
  return { score, signals };
}

function calculateCommGaps(comms: Communication[], sla: SLAConfig): { score: number; signals: Signal[] } {
  let score = 0;
  const signals: Signal[] = [];
  
  if (comms.length === 0) {
    score = 25; // No communication is a major gap
    signals.push({
      key: 'no_comm',
      label: 'No communication history',
      value: true,
      weight: 0.25
    });
    return { score, signals };
  }
  
  // Check for gaps in inbound communication
  const inboundComms = comms.filter(c => c.direction === 'inbound');
  if (inboundComms.length > 0) {
    const lastInbound = inboundComms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const daysSinceInbound = daysBetween(lastInbound.timestamp, new Date().toISOString());
    
    if (daysSinceInbound > sla.no_reply_days) {
      const breachPct = calculateBreachPercentage(daysSinceInbound, sla.no_reply_days);
      score += Math.min(25, breachPct * 25);
      signals.push({
        key: 'no_reply',
        label: `No reply gap: ${daysSinceInbound} days vs ${sla.no_reply_days} days`,
        value: breachPct,
        weight: 0.25
      });
    }
  }
  
  return { score, signals };
}

function calculateExceptionPatterns(shipments: Shipment[]): { score: number; signals: Signal[] } {
  let score = 0;
  const signals: Signal[] = [];
  
  if (shipments.length < 2) return { score, signals };
  
  // Count shipments with issues (delays, problems, etc.)
  const problemShipments = shipments.filter(s => 
    s.status === 'delayed' || 
    s.status === 'problem' || 
    (s.dwellDays && s.dwellDays > 3)
  );
  
  const exceptionRate = problemShipments.length / shipments.length;
  
  if (exceptionRate >= 0.5) {
    score = 20;
    signals.push({
      key: 'high_exceptions',
      label: `High exception rate: ${Math.round(exceptionRate * 100)}%`,
      value: exceptionRate,
      weight: 0.2
    });
  } else if (exceptionRate >= 0.3) {
    score = 10;
    signals.push({
      key: 'moderate_exceptions',
      label: `Moderate exception rate: ${Math.round(exceptionRate * 100)}%`,
      value: exceptionRate,
      weight: 0.1
    });
  }
  
  return { score, signals };
}

function calculateSentimentDecline(comms: Communication[]): { score: number; signals: Signal[] } {
  let score = 0;
  const signals: Signal[] = [];
  
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
// Notification Rule Checkers
// ============================================================================

function checkQuoteSlaBreach(deal: Deal, shipments: Shipment[], sla: SLAConfig, now: string): Notification | null {
  for (const shipment of shipments) {
    if (shipment.quoteRequestedAt && !shipment.quoteProvidedAt) {
      const hoursSinceRequest = hoursBetween(shipment.quoteRequestedAt, now);
      if (hoursSinceRequest > sla.quote_hours) {
        const breachPct = calculateBreachPercentage(hoursSinceRequest, sla.quote_hours);
        return createNotification(
          'quote_sla_breach',
          getSeverity(breachPct),
          { kind: 'deal', id: deal.id, name: `Deal ${deal.id}` },
          {
            cxRisk: Math.min(100, breachPct * 100),
            winLikelihood: Math.max(0, 50 - breachPct * 30)
          },
          [
            { label: 'Quote requested', value: shipment.quoteRequestedAt, timestamp: shipment.quoteRequestedAt },
            { label: 'Hours overdue', value: `${hoursSinceRequest}h vs ${sla.quote_hours}h`, timestamp: now }
          ],
          'Provide quote immediately to maintain customer confidence',
          [
            { label: 'View Deal', ref: `/deals/${deal.id}` },
            { label: 'Create Quote', ref: `/quotes/new?deal=${deal.id}` }
          ]
        );
      }
    }
  }
  return null;
}

function checkOwnerIdle(deal: Deal, comms: Communication[], sla: SLAConfig, now: string): Notification | null {
  const outboundComms = comms.filter(c => c.direction === 'outbound');
  if (outboundComms.length === 0) return null;
  
  const lastOutbound = outboundComms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const hoursSinceLastTouch = hoursBetween(lastOutbound.timestamp, now);
  
  const stageHours = deal.stage === 'proposal' ? sla.owner_touch_hours.pre : sla.owner_touch_hours.post;
  
  if (hoursSinceLastTouch > stageHours) {
    const breachPct = calculateBreachPercentage(hoursSinceLastTouch, stageHours);
    return createNotification(
      'owner_idle',
      getSeverity(breachPct),
      { kind: 'deal', id: deal.id, name: `Deal ${deal.id}` },
      {
        cxRisk: Math.min(100, breachPct * 80),
        winLikelihood: Math.max(0, 50 - breachPct * 20)
      },
      [
        { label: 'Last touch', value: lastOutbound.timestamp, timestamp: lastOutbound.timestamp },
        { label: 'Hours idle', value: `${hoursSinceLastTouch}h vs ${stageHours}h`, timestamp: now }
      ],
      'Schedule immediate follow-up call to re-engage customer',
      [
        { label: 'View Deal', ref: `/deals/${deal.id}` },
        { label: 'Schedule Call', ref: `/calendar/new?deal=${deal.id}` }
      ]
    );
  }
  return null;
}

function checkNoReply(deal: Deal, comms: Communication[], sla: SLAConfig, now: string): Notification | null {
  const inboundComms = comms.filter(c => c.direction === 'inbound');
  if (inboundComms.length === 0) return null;
  
  const lastInbound = inboundComms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const daysSinceInbound = daysBetween(lastInbound.timestamp, now);
  
  if (daysSinceInbound > sla.no_reply_days) {
    const breachPct = calculateBreachPercentage(daysSinceInbound, sla.no_reply_days);
    return createNotification(
      'no_reply',
      getSeverity(breachPct),
      { kind: 'deal', id: deal.id, name: `Deal ${deal.id}` },
      {
        cxRisk: Math.min(100, breachPct * 70),
        winLikelihood: Math.max(0, 50 - breachPct * 25)
      },
      [
        { label: 'Last inbound', value: lastInbound.timestamp, timestamp: lastInbound.timestamp },
        { label: 'Days without reply', value: `${daysSinceInbound} days vs ${sla.no_reply_days} days`, timestamp: now }
      ],
      'Send follow-up message to address customer inquiry',
      [
        { label: 'View Deal', ref: `/deals/${deal.id}` },
        { label: 'Send Message', ref: `/messages/new?deal=${deal.id}` }
      ]
    );
  }
  return null;
}

function checkBookingConfirmDelay(shipments: Shipment[], sla: SLAConfig, now: string): Notification | null {
  for (const shipment of shipments) {
    if (shipment.quoteProvidedAt && !shipment.bookingConfirmedAt) {
      const hoursSinceQuote = hoursBetween(shipment.quoteProvidedAt, now);
      if (hoursSinceQuote > sla.booking_confirm_hours) {
        const breachPct = calculateBreachPercentage(hoursSinceQuote, sla.booking_confirm_hours);
        return createNotification(
          'booking_confirm_delay',
          getSeverity(breachPct),
          { kind: 'shipment', id: shipment.id, name: `Shipment ${shipment.trackingNumber}` },
          {
            cxRisk: Math.min(100, breachPct * 60)
          },
          [
            { label: 'Quote provided', value: shipment.quoteProvidedAt, timestamp: shipment.quoteProvidedAt },
            { label: 'Hours pending', value: `${hoursSinceQuote}h vs ${sla.booking_confirm_hours}h`, timestamp: now }
          ],
          'Follow up on quote acceptance and booking confirmation',
          [
            { label: 'View Shipment', ref: `/shipments/${shipment.id}` },
            { label: 'Contact Customer', ref: `/messages/new?shipment=${shipment.id}` }
          ]
        );
      }
    }
  }
  return null;
}

function checkDwellExceeded(shipments: Shipment[], sla: SLAConfig, now: string): Notification | null {
  for (const shipment of shipments) {
    if (shipment.dwellDays && shipment.dwellDays > sla.dwell_days) {
      const breachPct = calculateBreachPercentage(shipment.dwellDays, sla.dwell_days);
      return createNotification(
        'dwell_exceeded',
        getSeverity(breachPct),
        { kind: 'shipment', id: shipment.id, name: `Shipment ${shipment.trackingNumber}` },
        {
          cxRisk: Math.min(100, breachPct * 80)
        },
        [
          { label: 'Current dwell', value: `${shipment.dwellDays} days`, timestamp: now },
          { label: 'SLA limit', value: `${sla.dwell_days} days`, timestamp: now }
        ],
        'Expedite pickup to reduce dwell time and improve service',
        [
          { label: 'View Shipment', ref: `/shipments/${shipment.id}` },
          { label: 'Schedule Pickup', ref: `/pickups/new?shipment=${shipment.id}` }
        ]
      );
    }
  }
  return null;
}

function checkPodLatency(shipments: Shipment[], sla: SLAConfig, now: string): Notification | null {
  for (const shipment of shipments) {
    if (shipment.deliveredAt && !shipment.podReceivedAt) {
      const hoursSinceDelivery = hoursBetween(shipment.deliveredAt, now);
      if (hoursSinceDelivery > sla.pod_hours) {
        const breachPct = calculateBreachPercentage(hoursSinceDelivery, sla.pod_hours);
        return createNotification(
          'pod_latency',
          getSeverity(breachPct),
          { kind: 'shipment', id: shipment.id, name: `Shipment ${shipment.trackingNumber}` },
          {
            cxRisk: Math.min(100, breachPct * 50)
          },
          [
            { label: 'Delivered', value: shipment.deliveredAt, timestamp: shipment.deliveredAt },
            { label: 'POD overdue', value: `${hoursSinceDelivery}h vs ${sla.pod_hours}h`, timestamp: now }
          ],
          'Follow up on POD collection to complete delivery process',
          [
            { label: 'View Shipment', ref: `/shipments/${shipment.id}` },
            { label: 'Request POD', ref: `/pod/request?shipment=${shipment.id}` }
          ]
        );
      }
    }
  }
  return null;
}

function checkExceptionStreak(shipments: Shipment[]): Notification | null {
  if (shipments.length < 2) return null;
  
  const recentShipments = shipments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  const problemShipments = recentShipments.filter(s => 
    s.status === 'delayed' || 
    s.status === 'problem' || 
    (s.dwellDays && s.dwellDays > 3)
  );
  
  if (problemShipments.length >= 2) {
    const exceptionRate = problemShipments.length / recentShipments.length;
    return createNotification(
      'exception_streak',
      exceptionRate >= 0.6 ? 'high' : 'medium',
      { kind: 'account', id: recentShipments[0].accountId, name: `Account ${recentShipments[0].accountId}` },
      {
        cxRisk: Math.min(100, exceptionRate * 100)
      },
      [
        { label: 'Recent shipments', value: recentShipments.length, timestamp: new Date().toISOString() },
        { label: 'Problem shipments', value: problemShipments.length, timestamp: new Date().toISOString() },
        { label: 'Exception rate', value: `${Math.round(exceptionRate * 100)}%`, timestamp: new Date().toISOString() }
      ],
      'Review operational processes and customer communication to prevent further issues',
      [
        { label: 'View Account', ref: `/accounts/${recentShipments[0].accountId}` },
        { label: 'Review Shipments', ref: `/shipments?account=${recentShipments[0].accountId}` }
      ]
    );
  }
  return null;
}

function checkSentimentDecline(comms: Communication[]): Notification | null {
  if (comms.length < 3) return null;
  
  const sortedComms = comms.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const recentComms = sortedComms.slice(-5);
  
  const sentimentValues = recentComms.map(c => {
    switch (c.sentiment) {
      case 'positive': return 1;
      case 'negative': return -1;
      default: return 0;
    }
  });
  
  const avgSentiment = sentimentValues.reduce<number>((sum, val) => sum + val, 0) / sentimentValues.length;
  
  if (avgSentiment < -0.4) {
    return createNotification(
      'sentiment_decline',
      'medium',
      { kind: 'account', id: comms[0].entityId, name: `Account ${comms[0].entityId}` },
      {
        cxRisk: Math.min(100, Math.abs(avgSentiment) * 100)
      },
      [
        { label: 'Recent communications', value: recentComms.length, timestamp: new Date().toISOString() },
        { label: 'Average sentiment', value: avgSentiment.toFixed(2), timestamp: new Date().toISOString() }
      ],
      'Schedule customer success call to address concerns and improve relationship',
      [
        { label: 'View Account', ref: `/accounts/${comms[0].entityId}` },
        { label: 'Schedule Call', ref: `/calendar/new?account=${comms[0].entityId}` }
      ]
    );
  }
  return null;
}

// ============================================================================
// Utility Functions
// ============================================================================

function createNotification(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  entity: EntityRef,
  score: { cxRisk?: number; winLikelihood?: number; marginRisk?: number },
  evidence: Evidence[],
  recommendation: string,
  links: Link[]
): Notification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    time: new Date().toISOString(),
    type,
    severity,
    entity,
    score,
    evidence,
    recommendation,
    links
  };
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
}

function hoursBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60);
}

// ============================================================================
// Priority Computation and Deduplication
// ============================================================================

/**
 * Computes priority score for a notification based on severity, breach size, and account tier.
 * 
 * @param notif - The notification to compute priority for
 * @param weights - Weights configuration for scoring
 * @param accountTier - Account tier ('A', 'B', 'C')
 * @returns Priority score (higher = more urgent)
 */
export function computePriority(
  notif: Notification, 
  weights: any, 
  accountTier: 'A' | 'B' | 'C' = 'C'
): number {
  // Base priority from severity
  const severityWeight = getSeverityWeight(notif.severity);
  
  // Breach size factor (based on CX risk score)
  const breachSize = (notif.score.cxRisk || 0) / 100;
  
  // Account tier multiplier
  const accountTierMultiplier = {
    'A': 1.5,  // Enterprise accounts get higher priority
    'B': 1.2,  // Mid-market accounts get moderate priority
    'C': 1.0   // Small business accounts get base priority
  }[accountTier];
  
  // Calculate priority using the formula from spec
  const priority = (
    severityWeight * breachSize * 100 +
    weights.exceptions * (notif.evidence.length || 0) +
    accountTierMultiplier * 10
  );
  
  return Math.round(priority);
}

/**
 * Deduplicates notifications by collapsing same entity.id + type within 24 hours.
 * Keeps the highest severity and latest evidence.
 * 
 * @param notifs - Array of notifications to deduplicate
 * @returns Deduplicated array of notifications
 */
export function dedupeNotifications(notifs: Notification[]): Notification[] {
  const grouped = new Map<string, Notification[]>();
  
  // Group notifications by entity.id + type
  for (const notif of notifs) {
    const key = `${notif.entity.id}-${notif.type}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(notif);
  }
  
  const deduplicated: Notification[] = [];
  
  for (const [_key, group] of grouped) {
    if (group.length === 1) {
      deduplicated.push(group[0]);
      continue;
    }
    
    // Sort by time (newest first)
    group.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    const newest = group[0];
    const oldest = group[group.length - 1];
    
    // Check if notifications are within 24 hours
    const timeDiff = new Date(newest.time).getTime() - new Date(oldest.time).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff <= 24) {
      // Within 24 hours - deduplicate
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      
      // Find highest severity
      const highestSeverity = group.reduce((highest, current) => {
        return severityOrder[current.severity] > severityOrder[highest.severity] 
          ? current 
          : highest;
      });
      
      // Merge evidence from all notifications
      const allEvidence = group.flatMap(n => n.evidence);
      const uniqueEvidence = allEvidence.filter((evidence, index, arr) => 
        arr.findIndex(e => e.label === evidence.label) === index
      );
      
      // Create merged notification
      const merged: Notification = {
        ...highestSeverity,
        evidence: uniqueEvidence,
        recommendation: highestSeverity.recommendation,
        // Update time to most recent
        time: newest.time
      };
      
      deduplicated.push(merged);
    } else {
      // More than 24 hours apart - keep all
      deduplicated.push(...group);
    }
  }
  
  return deduplicated;
}
