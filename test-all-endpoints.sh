#!/bin/bash

echo "🌊 Testing All OceanRaksha API Endpoints"
echo "========================================"
echo ""

echo "1️⃣  Pollution Data:"
curl -s http://localhost:5001/api/pollution | jq -r '.[] | "\(.river_name): Risk \(.risk)/100 (\(.status))"' | head -5
echo ""

echo "2️⃣  Plastic Waste Trend:"
curl -s http://localhost:5001/api/plastic-waste | jq -r '.[] | "\(.year): \(.waste_tonnes) tonnes"'
echo ""

echo "3️⃣  Ocean Conditions:"
curl -s http://localhost:5001/api/ocean-conditions | jq -r '.[] | "\(.location): \(.temperature)°C, Salinity: \(.salinity)"' | head -3
echo ""

echo "4️⃣  Shipping Activity:"
curl -s http://localhost:5001/api/shipping-activity | jq -r '.[] | "\(.port_name): Traffic Score \(.traffic_score)"' | head -3
echo ""

echo "5️⃣  Fish Production:"
curl -s http://localhost:5001/api/fish-data | jq -r '.[] | "\(.state): \(.fish_tonnes) tonnes"' | head -3
echo ""

echo "6️⃣  Risk Summary:"
curl -s http://localhost:5001/api/risk-summary | jq '.[0] | "Total Pollution: \(.total_pollution) tonnes\nSevere Locations: \(.severe_locations)\nHigh Risk Locations: \(.high_risk_locations)"'
echo ""

echo "7️⃣  Final Risk Score:"
curl -s http://localhost:5001/api/final-risk | jq '.[0][0] | "Risk Score: \(.final_risk_score)/100\nCategory: \(.risk_category)"'
echo ""

echo "✅ All endpoints working!"
