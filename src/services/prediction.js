// 🎯 Future Invasion Risk Prediction

export function predictRisk(currentRisk, shippingTrend, tempTrend) {
  const futureRisk = currentRisk + (shippingTrend * 0.5) + (tempTrend * 0.5);
  return Math.min(100, Math.max(0, futureRisk));
}

export function getFutureRiskAnalysis(location, shippingData, oceanData) {
  const currentRisk = location.risk || 70;
  
  // Calculate trends (simulated based on current data)
  const shippingTrend = shippingData?.traffic_score > 80 ? 10 : 5;
  const tempTrend = oceanData?.temperature > 29 ? 5 : 2;
  
  const futureRisk = predictRisk(currentRisk, shippingTrend, tempTrend);
  
  const getRiskStatus = (risk) => {
    if (risk >= 80) return 'SEVERE RISK IN 90 DAYS';
    if (risk >= 60) return 'HIGH RISK IN 90 DAYS';
    if (risk >= 40) return 'MODERATE RISK IN 90 DAYS';
    return 'LOW RISK IN 90 DAYS';
  };
  
  return {
    currentRisk,
    futureRisk: Math.round(futureRisk),
    riskIncrease: Math.round(futureRisk - currentRisk),
    status: getRiskStatus(futureRisk),
    factors: {
      shipping: shippingTrend,
      temperature: tempTrend
    },
    prediction: `Based on current shipping trends (+${shippingTrend}) and temperature patterns (+${tempTrend}), risk is projected to ${futureRisk > currentRisk ? 'increase' : 'remain stable'} over the next 90 days.`
  };
}

// Global shipping routes (major invasion pathways)
export const GLOBAL_SHIPPING_ROUTES = [
  {
    id: 'singapore-mumbai',
    from: [1.29, 103.85],
    to: [19.07, 72.87],
    fromName: 'Singapore',
    toName: 'Mumbai',
    risk: 95,
    species: ['Lionfish', 'Asian Green Mussel']
  },
  {
    id: 'jebel-chennai',
    from: [25.2, 55.27],
    to: [13.08, 80.27],
    fromName: 'Jebel Ali (Dubai)',
    toName: 'Chennai',
    risk: 87,
    species: ['Crown-of-thorns Starfish']
  },
  {
    id: 'rotterdam-kochi',
    from: [51.92, 4.48],
    to: [9.93, 76.26],
    fromName: 'Rotterdam',
    toName: 'Kochi',
    risk: 72,
    species: ['European Green Crab']
  },
  {
    id: 'busan-vizag',
    from: [35.18, 129.08],
    to: [17.68, 83.21],
    fromName: 'Busan',
    toName: 'Visakhapatnam',
    risk: 68,
    species: ['Japanese Kelp']
  }
];

// Simulate ship positions along routes
export function generateShipPositions(routes, time = Date.now()) {
  return routes.map((route, idx) => {
    // Calculate position along route based on time
    const progress = ((time / 10000) + (idx * 0.25)) % 1;
    
    const lat = route.from[0] + (route.to[0] - route.from[0]) * progress;
    const lng = route.from[1] + (route.to[1] - route.from[1]) * progress;
    
    return {
      id: `ship-${route.id}`,
      lat,
      lng,
      route: route.id,
      fromPort: route.fromName,
      toPort: route.toName,
      risk: route.risk,
      species: route.species,
      progress: Math.round(progress * 100)
    };
  });
}
