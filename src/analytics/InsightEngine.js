// No imports needed for JavaScript types

// Constants for threshold-based insights
const MIN_GROUP = 8;             // min rows to trust a pattern
const LANE_DELAY_DAYS = 2;       // >2 days avg delay
const UNDERPERF_DELTA = 1.5;     // >1.5 days worse than fleet avg
const MODE_SHIFT_AIR_MAX_KM = 800;
const COST_SPIKE_PCT = 0.25;     // +25% vs baseline
const EMISSIONS_REDUCTION_PCT = 0.15; // 15% reduction opportunity

// Data enrichment functions
export function computeDerived(shipment) {
  const enriched = { ...shipment };
  
  // Calculate delay days
  if (shipment.promisedDate && shipment.arrivalDate) {
    const promised = new Date(shipment.promisedDate);
    const arrived = new Date(shipment.arrivalDate);
    enriched.delayDays = Math.round((arrived.getTime() - promised.getTime()) / (1000 * 60 * 60 * 24));
    enriched.onTime = enriched.delayDays <= 0;
  }
  
  // Calculate cost metrics
  if (shipment.costUsd && shipment.distanceKm) {
    enriched.costPerKm = shipment.costUsd / shipment.distanceKm;
  }
  
  // Calculate weight-distance metrics
  if (shipment.weightKg && shipment.distanceKm) {
    const tonnes = shipment.weightKg / 1000;
    enriched.tonneKm = tonnes * shipment.distanceKm;
    
    if (shipment.costUsd) {
      enriched.costPerTonne = shipment.costUsd / tonnes;
      enriched.costPerTonneKm = shipment.costUsd / enriched.tonneKm;
    }
  }
  
  // Estimate emissions (rough formula: kg CO2 per tonne-km by mode)
  const emissionsFactors = {
    'Air': 0.8,
    'Ocean': 0.01,
    'Road': 0.09,
    'Rail': 0.025
  };
  
  if (shipment.weightKg && shipment.distanceKm && shipment.mode) {
    const tonnes = shipment.weightKg / 1000;
    const factor = emissionsFactors[shipment.mode] || 0.05;
    enriched.estimatedEmissions = tonnes * shipment.distanceKm * factor;
  }
  
  return enriched;
}

// Helper functions for analysis
function groupBy(data, key) {
  const groups = new Map();
  
  data.forEach(item => {
    const value = String(item[key] || 'Unknown');
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(item);
  });
  
  return groups;
}

function median(arr: number[]): number {
  const sorted = arr.sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function percentile(arr: number[], p: number): number {
  const sorted = arr.sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function calculateConfidence(sampleSize: number, effectSize: number, baselineMetric?: number): number {
  // Confidence based on sample size and effect magnitude
  const sizeFactor = Math.min(sampleSize / MIN_GROUP, 1);
  const effectFactor = Math.min(Math.abs(effectSize) / (baselineMetric || 1), 2) / 2;
  return Math.min(sizeFactor * 0.7 + effectFactor * 0.3, 1);
}

// Individual insight rules
export function ruleCarrierUnderperformance(shipments) {
  const insights = [];
  const carriers = groupBy(shipments.filter(s => s.delayDays !== undefined), 'carrier');
  
  if (carriers.size < 2) return insights;
  
  // Calculate fleet average delay
  const allDelays = shipments
    .filter(s => s.delayDays !== undefined)
    .map(s => s.delayDays!)
    .sort((a, b) => b - a); // sort descending
  
  const fleetMedian = median(allDelays);
  
  carriers.forEach((carrierShipments, carrier) => {
    const delays = carrierShipments.map(s => s.delayDays!);
    if (delays.length < MIN_GROUP) return;
    
    const avgDelay = delays.reduce((sum, d) => sum + d, 0) / delays.length;
    const delayDiff = avgDelay - fleetMedian;
    
    if (delayDiff > UNDERPERF_DELTA) {
      const onTimeRate = carrierShipments.filter(s => s.onTime).length / carrierShipments.length;
      const severity = avgDelay > 5 ? 5 : avgDelay > 3 ? 4 : 3;
      
      insights.push({
        id: `carrier-underperf-${carrier}`,
        title: `Carrier Underperformance: ${carrier}`,
        summary: `${carrier} averages ${avgDelay.toFixed(1)} days delay vs fleet median of ${fleetMedian.toFixed(1)} days.`,
        tags: ['delay', 'ops'],
        severity: severity,
        confidence: calculateConfidence(carrierShipments.length, delayDiff, fleetMedian),
        evidence: [{
          label: 'Performance Metrics',
          metrics: {
            'Carrier': carrier,
            'Avg Delay': `${avgDelay.toFixed(1)} days`,
            'On-time Rate': `${(onTimeRate * 100).toFixed(1)}%`,
            'Shipments': carrierShipments.length.toString(),
            'Delay vs Fleet': `+${delayDiff.toFixed(1)} days`
          },
          sampleIds: carrierShipments.slice(0, 5).map(s => s.id || '')
        }],
        action: `Consider switching carriers for routes with ${carrier}. Re-bid high-volume lanes in Q4.`
      });
    }
  });
  
  return insights;
}

export function ruleLaneDelay(shipments) {
  const insights = [];
  const lanes = groupBy(shipments.filter(s => s.delayDays !== undefined && s.lane), 'lane');
  
  lanes.forEach((laneShipments, lane) => {
    if (laneShipments.length < MIN_GROUP) return;
    
    const delays = laneShipments.map(s => s.delayDays!);
    const avgDelay = delays.reduce((sum, d) => sum + d, 0) / delays.length;
    const p50Delay = median(delays);
    
    if (avgDelay > LANE_DELAY_DAYS && p50Delay > LANE_DELAY_DAYS) {
      const lateRate = laneShipments.filter(s => !s.onTime).length / laneShipments.length;
      const severity = lateRate > 0.5 ? 4 : 3;
      
      insights.push({
        id: `lane-delay-${lane}`,
        title: `Systemic Delays: ${lane}`,
        summary: `${lane} shows chronic delays with ${avgDelay.toFixed(1)} avg and ${(lateRate * 100).toFixed(1)}% late shipments.`,
        tags: ['delay', 'risk'],
        severity: severity,
        confidence: calculateConfidence(laneShipments.length, avgDelay),
        evidence: [{
          label: 'Lane Analysis',
          metrics: {
            'Lane': lane,
            'Avg Delay': `${avgDelay.toFixed(1)} days`,
            'Median Delay': `${p50Delay.toFixed(1)} days`,
            'Late Rate': `${(lateRate * 100).toFixed(1)}%`,
            'Shipments': laneShipments.length.toString()
          },
          sampleIds: laneShipments.filter(s => !s.onTime).slice(0, 5).map(s => s.id || '')
        }],
        action: `Review ${lane} routing options, customs processes, and transit times. Consider alternative ports/hubs.`
      });
    }
  });
  
  return insights;
}

export function ruleModeShift(shipments) {
  const insights = [];
  
  // Group by lane, analyze air shipments for mode shift opportunities
  const airShipments = shipments.filter(s => s.mode === 'Air' && s.distanceKm && s.costUsd);
  const laneGroups = groupBy(airShipments, 'lane');
  
  laneGroups.forEach((laneShipments, lane) => {
    const shortRoutes = laneShipments.filter(s => s.distanceKm! <= MODE_SHIFT_AIR_MAX_KM);
    
    if (shortRoutes.length < MIN_GROUP / 2) return;
    
    const avgDistance = shortRoutes.reduce((sum, s) => sum + s.distanceKm!, 0) / shortRoutes.length;
    const avgCostPerTonneKm = shortRoutes.reduce((sum, s) => sum + (s.costPerTonneKm || 0), 0) / shortRoutes.length;
    
    // Check if this lane has road/rail alternatives
    const allShipmentsOnLane = shipments.filter(s => s.lane === lane);
    const hasAlternativeModes = allShipmentsOnLane.some(s => s.mode === 'Road' || s.mode === 'Rail');
    
    if (hasAlternativeModes && avgDistance <= MODE_SHIFT_AIR_MAX_KM) {
      const roadShipments = allShipmentsOnLane.filter(s => s.mode === 'Road');
      const railShipments = allShipmentsOnLane.filter(s => s.mode === 'Rail');
      
      let potentialSavings = 0;
      let alternativeMode = '';
      
      if (roadShipments.length > 0) {
        const roadCost = roadShipments.reduce((sum, s) => sum + (s.costPerTonneKm || 0), 0) / roadShipments.length;
        if (roadCost < avgCostPerTonneKm * 0.6) { // 40% savings
          potentialSavings = (avgCostPerTonneKm - roadCost) / avgCostPerTonneKm;
          alternativeMode = 'Road';
        }
      }
      
      if (railShipments.length > 0) {
        const railCost = railShipments.reduce((sum, s) => sum + (s.costPerTonneKm || 0), 0) / railShipments.length;
        const railSavings = (avgCostPerTonneKm - railCost) / avgCostPerTonneKm;
        if (railSavings > potentialSavings && railCost < avgCostPerTonneKm * 0.6) {
          potentialSavings = railSavings;
          alternativeMode = 'Rail';
        }
      }
      
      if (potentialSavings > 0.3) { // 30%+ savings opportunity
        const severity = potentialSavings > 0.5 ? 5 : 4;
        
        insights.push({
          id: `mode-shift-${lane}`,
          title: `Mode Shift Opportunity: ${lane}`,
          summary: `${avgDistance.toFixed(0)}km ${lane} Air shipments could be moved to ${alternativeMode} for ${(potentialSavings * 100).toFixed(0)}% cost savings.`,
          tags: ['cost', 'savings', 'emissions'],
          severity: severity,
          confidence: calculateConfidence(shortRoutes.length, potentialSavings),
          evidence: [{
            label: 'Route Comparison',
            metrics: {
              'Lane': lane,
              'Distance': `${avgDistance.toFixed(0)} km`,
              'Air Cost/T-Km': `$${avgCostPerTonneKm.toFixed(2)}`,
              'Savings': `${(potentialSavings * 100).toFixed(0)}%`,
              'Shipments': shortRoutes.length.toString(),
              'Alternative': alternativeMode
            },
            sampleIds: shortRoutes.slice(0, 5).map(s => s.id || '')
          }],
          action: `Pilot ${alternativeMode} shipments on ${lane}. Update routing matrix for next quarter.`
        });
      }
    }
  });
  
  return insights;
}

export function ruleCostSpike(shipments) {
  const insights = [];
  
  // Sort by date to analyze recent trends
  const sortedShipments = shipments.filter(s => s.costUsd && s.costPerKm).sort((a, b) => {
    const dateA = new Date(a.arrivalDate || a.departDate || '1900-01-01').getTime();
    const dateB = new Date(b.arrivalDate || b.departDate || '1900-01-01').getTime();
    return dateB - dateA;
  });
  
  if (sortedShipments.length < MIN_GROUP * 1.5) return insights;
  
  // Compare recent vs older shipments
  const recentSplit = Math.floor(sortedShipments.length * 0.4);
  const recentShipments = sortedShipments.slice(0, recentSplit);
  const baselineShipments = sortedShipments.slice(recentSplit);
  
  // Analyze by mode and lane
  const modes = groupBy(sortedShipments, 'mode');
  
  modes.forEach((modeShipments, mode) => {
    const recentMode = recentShipments.filter(s => s.mode === mode);
    const baselineMode = baselineShipments.filter(s => s.mode === mode);
    
    if (recentMode.length < MIN_GROUP / 2 || baselineMode.length < MIN_GROUP / 2) return;
    
    const recentAvgCost = recentMode.reduce((sum, s) => sum + s.costPerKm!, 0) / recentMode.length;
    const baselineModeAvgCost = baselineMode.reduce((sum, s) => sum + s.costPerKm!, 0) / baselineMode.length;
    
    const costIncrease = (recentAvgCost - baselineModeAvgCost) / baselineModeAvgCost;
    
    if (costIncrease > COST_SPIKE_PCT) {
      const severity = costIncrease > 0.5 ? 5 : costIncrease > 0.4 ? 4 : 3;
      
      insights.push({
        id: `cost-spike-${mode}`,
        title: `Cost Spike Detected: ${mode}`,
        summary: `${mode} freight costs increased ${(costIncrease * 100).toFixed(1)}% in recent period vs baseline.`,
        tags: ['cost'],
        severity: severity,
        confidence: calculateConfidence(recentMode.length, costIncrease),
        evidence: [{
          label: 'Cost Trends',
          metrics: {
            'Mode': mode,
            'Recent Avg': `$${recentAvgCost.toFixed(3)}/km`,
            'Baseline Avg': `$${baselineModeAvgCost.toFixed(3)}/km`,
            'Increase': `${(costIncrease * 100).toFixed(1)}%`,
            'Recent Shipments': recentMode.length.toString(),
            'Baseline': baselineMode.length.toString()
          },
          sampleIds: recentMode.slice(0, 5).map(s => s.id || '')
        }],
        action: `Re-negotiate carrier rates for ${mode}. Consider alternative carriers or lanes.`
      });
    }
  });
  
  return insights;
}

export function ruleEmissionsHotspot(shipments) {
  const insights = [];
  const lanes = groupBy(shipments.filter(s => s.estimatedEmissions), 'lane');
  
  lanes.forEach((laneShipments, lane) => {
    if (laneShipments.length < MIN_GROUP / 2) return;
    
    const totalEmissions = laneShipments.reduce((sum, s) => sum + s.estimatedEmissions!, 0);
    const avgEmissionsPerShipment = totalEmissions / laneShipments.length;
    
    // Calculate emissions intensity
    const totalTonneKm = laneShipments.reduce((sum, s) => sum + (s.tonneKm || 0), 0);
    const emissionsIntensity = totalEmissions / (totalTonneKm || 1);
    
    // Find the highest emissions routes
    const emissionRoutes = laneShipments.sort((a, b) => (b.estimatedEmissions || 0) - (a.estimatedEmissions || 0));
    
    if (avgEmissionsPerShipment > 50 && emissionRoutes.length > 0) { // Threshold for "hotspot"
      const severity = avgEmissionsPerShipment > 100 ? 4 : 3;
      
      insights.push({
        id: `emissions-hotspot-${lane}`,
        title: `Emissions Hotspot: ${lane}`,
        summary: `${lane} generates ${avgEmissionsPerShipment.toFixed(1)} kg CO2 per shipment on average.`,
        tags: ['emissions', 'risk'],
        severity: severity,
        confidence: calculateConfidence(laneShipments.length, avgEmissionsPerShipment, 50),
        evidence: [{
          label: 'Emissions Analysis',
          metrics: {
            'Lane': lane,
            'Avg CO2/Shipment': `${avgEmissionsPerShipment.toFixed(1)} kg`,
            'Intensity': `${emissionsIntensity.toFixed(3)} kg/tonne-km`,
            'Total Shipments': laneShipments.length.toString(),
            'Total Tonne-Km': totalTonneKm.toFixed(0)
          },
          sampleIds: emissionRoutes.slice(0, 5).map(s => s.id || '')
        }],
        action: `Consider optimizing ${lane} for better equipment utilization or alternative mode switching.`
      });
    }
  });
  
  return insights;
}

// Main engine function
export function runInsights(rows) {
  if (!rows || rows.length === 0) return [];
  
  const enriched = rows.map(computeDerived);
  const insights = [
    ...ruleCarrierUnderperformance(enriched),
    ...ruleLaneDelay(enriched),
    ...ruleModeShift(enriched),
    ...ruleCostSpike(enriched),
    ...ruleEmissionsHotspot(enriched),
  ];
  
  // Rank insights by severity and confidence, dedupe
  const rankedInsights = insights
    .filter((insight, index, arr) => 
      arr.findIndex(i => i.id === insight.id) === index
    )
    .sort((a, b) => {
      // Primary sort by severity, secondary by confidence
      const severityDiff = b.severity - a.severity;
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  
  // Limit results: top 3 per tag, max 10 overall
  const tagCounts = {};
  
  return rankedInsights.filter(insight => {
    const keepInsight = insight.tags.some(tag => {
      const count = tagCounts[tag] || 0;
      if (count < 3) {
        tagCounts[tag] = count + 1;
        return true;
      }
      return false;
    });
    
    return keepInsight;
  }).slice(0, 10);
}
