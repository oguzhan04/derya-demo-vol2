#!/bin/bash
echo "Testing server endpoints..."
echo ""

echo "1. Testing /api/ai-employees..."
curl -s http://localhost:3001/api/ai-employees | jq 'length' 2>/dev/null || echo "Failed or jq not installed"

echo ""
echo "2. Testing /api/ai-actions..."
curl -s 'http://localhost:3001/api/ai-actions?limit=5' | jq 'length' 2>/dev/null || echo "Failed or jq not installed"

echo ""
echo "3. Testing /api/shipments..."
curl -s http://localhost:3001/api/shipments | jq 'length' 2>/dev/null || echo "Failed or jq not installed"

echo ""
echo "4. Testing POST /api/ai-events/arrival-notice..."
curl -s -X POST http://localhost:3001/api/ai-events/arrival-notice -H "Content-Type: application/json" | jq '.success' 2>/dev/null || echo "Failed or jq not installed"

echo ""
echo "Server status check complete!"

