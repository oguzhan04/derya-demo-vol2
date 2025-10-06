// Basic analysis functions for load data
// These functions compute insights from the normalized load data

import { getAllLoads } from '../data/mockLoads';

// Calculate similarity between two loads
export const calculateLoadSimilarity = (load1, load2) => {
  let similarity = 0;
  let factors = 0;

  // Route similarity (40% weight)
  if (load1.route.origin === load2.route.origin && load1.route.destination === load2.route.destination) {
    similarity += 0.4;
  } else if (load1.route.origin === load2.route.destination && load1.route.destination === load2.route.origin) {
    similarity += 0.3; // reverse route
  } else if (load1.route.origin === load2.route.origin || load1.route.destination === load2.route.destination) {
    similarity += 0.2; // partial match
  }
  factors += 0.4;

  // Cargo type similarity (25% weight)
  if (load1.cargo.type === load2.cargo.type) {
    similarity += 0.25;
  }
  factors += 0.25;

  // Transport mode similarity (15% weight)
  if (load1.route.mode === load2.route.mode) {
    similarity += 0.15;
  }
  factors += 0.15;

  // Cargo value similarity (10% weight)
  const valueDiff = Math.abs(load1.cargo.value - load2.cargo.value) / Math.max(load1.cargo.value, load2.cargo.value);
  if (valueDiff < 0.2) {
    similarity += 0.1;
  } else if (valueDiff < 0.5) {
    similarity += 0.05;
  }
  factors += 0.1;

  // Container count similarity (10% weight)
  if (load1.cargo.containers === load2.cargo.containers) {
    similarity += 0.1;
  }
  factors += 0.1;

  return factors > 0 ? similarity / factors : 0;
};

// Find similar loads for a given load
export const findSimilarLoads = (targetLoad, allLoads, limit = 5) => {
  const similarities = allLoads
    .filter(load => load.id !== targetLoad.id)
    .map(load => ({
      load,
      similarity: calculateLoadSimilarity(targetLoad, load)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return similarities.map(item => ({
    id: item.load.id,
    similarity: item.similarity,
    outcome: getLoadOutcome(item.load)
  }));
};

// Determine load outcome for historical analysis
export const getLoadOutcome = (load) => {
  if (load.status === 'delivered') {
    // Calculate if delivered on time
    const createdAt = new Date(load.createdAt);
    const updatedAt = new Date(load.updatedAt);
    const actualDays = Math.ceil((updatedAt - createdAt) / (1000 * 60 * 60 * 24));
    const expectedDays = load.route.estimatedTransitDays;
    
    if (actualDays <= expectedDays) {
      return 'delivered_on_time';
    } else {
      const delayDays = actualDays - expectedDays;
      return `delayed_${delayDays}_days`;
    }
  } else if (load.status === 'cancelled') {
    return 'cancelled';
  } else {
    return 'in_progress';
  }
};

// Calculate risk score based on historical patterns
export const calculateRiskScore = (load, similarLoads) => {
  let riskFactors = 0;
  let totalFactors = 0;

  // Route risk (30% weight)
  const routeRisk = getRouteRisk(load.route);
  riskFactors += routeRisk * 0.3;
  totalFactors += 0.3;

  // Cargo risk (20% weight)
  const cargoRisk = getCargoRisk(load.cargo);
  riskFactors += cargoRisk * 0.2;
  totalFactors += 0.2;

  // Historical performance (30% weight)
  const historicalRisk = getHistoricalRisk(similarLoads);
  riskFactors += historicalRisk * 0.3;
  totalFactors += 0.3;

  // Seasonality risk (20% weight)
  const seasonalityRisk = getSeasonalityRisk(load);
  riskFactors += seasonalityRisk * 0.2;
  totalFactors += 0.2;

  return totalFactors > 0 ? Math.min(riskFactors / totalFactors, 1) : 0.5;
};

// Route-specific risk assessment
const getRouteRisk = (route) => {
  const highRiskRoutes = [
    'Shanghai-Los Angeles', // Peak season congestion
    'Singapore-Rotterdam'   // Long distance, multiple ports
  ];
  
  const routeString = `${route.origin}-${route.destination}`;
  
  if (highRiskRoutes.includes(routeString)) {
    return 0.7;
  } else if (route.mode === 'ocean' && route.distance > 5000) {
    return 0.6;
  } else if (route.mode === 'ocean') {
    return 0.4;
  } else {
    return 0.3;
  }
};

// Cargo-specific risk assessment
const getCargoRisk = (cargo) => {
  let risk = 0.3; // base risk

  if (cargo.hazardous) {
    risk += 0.3;
  }
  
  if (cargo.temperatureControlled) {
    risk += 0.2;
  }
  
  if (cargo.value > 100000) {
    risk += 0.1;
  }

  return Math.min(risk, 1);
};

// Historical performance risk
const getHistoricalRisk = (similarLoads) => {
  if (similarLoads.length === 0) {
    return 0.5; // neutral if no historical data
  }

  const delayedLoads = similarLoads.filter(load => 
    load.outcome && load.outcome.includes('delayed')
  );
  
  const delayRate = delayedLoads.length / similarLoads.length;
  return delayRate;
};

// Seasonality risk assessment
const getSeasonalityRisk = (load) => {
  const month = new Date(load.createdAt).getMonth();
  
  // Peak season months (higher risk)
  const peakMonths = [10, 11, 0, 1, 2]; // Oct, Nov, Dec, Jan, Feb
  
  if (peakMonths.includes(month)) {
    return 0.7;
  } else {
    return 0.3;
  }
};

// Predict cost based on historical data
export const predictCost = (load, similarLoads) => {
  if (similarLoads.length === 0) {
    // Fallback to route-based estimation
    return estimateCostByRoute(load.route);
  }

  // For now, use route-based estimation since similar loads don't have analysis yet
  return estimateCostByRoute(load.route);
};

// Estimate cost by route (fallback)
const estimateCostByRoute = (route) => {
  const baseRates = {
    'Shanghai-Los Angeles': 3200,
    'Hamburg-New York': 2800,
    'Singapore-Rotterdam': 4200
  };
  
  const routeString = `${route.origin}-${route.destination}`;
  return baseRates[routeString] || 3000;
};

// Predict transit time based on historical data
export const predictTransitTime = (load, similarLoads) => {
  if (similarLoads.length === 0) {
    return load.route.estimatedTransitDays;
  }

  // For now, use the load's own estimated transit time
  return load.route.estimatedTransitDays;
};

// Generate alerts based on risk factors
export const generateAlerts = (load, riskScore) => {
  const alerts = [];

  if (riskScore > 0.7) {
    alerts.push({
      type: 'high_risk',
      message: 'High risk load - monitor closely',
      severity: 'high'
    });
  }

  if (load.route.origin === 'Shanghai' && load.route.destination === 'Los Angeles') {
    alerts.push({
      type: 'route',
      message: 'Peak season congestion expected at LA port',
      severity: 'medium'
    });
  }

  if (load.cargo.hazardous) {
    alerts.push({
      type: 'cargo',
      message: 'Hazardous cargo - ensure proper documentation',
      severity: 'medium'
    });
  }

  return alerts;
};

// Generate recommendations based on analysis
export const generateRecommendations = (load, similarLoads, riskScore) => {
  const recommendations = [];

  if (riskScore > 0.6) {
    recommendations.push({
      type: 'risk_mitigation',
      message: 'Consider alternative routing to reduce risk',
      impact: 'high'
    });
  }

  if (load.route.mode === 'ocean' && load.route.distance > 5000) {
    recommendations.push({
      type: 'timing',
      message: 'Book early for optimal sailing schedule',
      impact: 'medium'
    });
  }

  if (load.cargo.value > 100000) {
    recommendations.push({
      type: 'insurance',
      message: 'Consider additional cargo insurance',
      impact: 'medium'
    });
  }

  return recommendations;
};

// Main analysis function that computes all insights
export const analyzeLoad = (load) => {
  const allLoads = getAllLoads();
  const similarLoads = findSimilarLoads(load, allLoads);
  const riskScore = calculateRiskScore(load, similarLoads);
  const predictedCost = predictCost(load, similarLoads);
  const predictedTransitTime = predictTransitTime(load, similarLoads);
  const alerts = generateAlerts(load, riskScore);
  const recommendations = generateRecommendations(load, similarLoads, riskScore);

  return {
    riskScore: Math.round(riskScore * 100) / 100,
    predictedCost,
    predictedTransitDays: predictedTransitTime,
    similarLoads,
    alerts,
    recommendations
  };
};
