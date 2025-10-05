#!/bin/bash

# RAG Pipeline Test Script
# Tests all three endpoints: ingest, search, analyze

BASE_URL="http://localhost:5174/api"
DOC_ID="demo1"
SAMPLE_TEXT="This is a Bill of Lading for shipment ABC123. The shipper is ABC Trading Co. located in Los Angeles, USA. The consignee is XYZ Import Ltd. in Hamburg, Germany. The cargo consists of 15,000 kg of electronics components with a volume of 25 CBM. The freight rate is $2,500 with total charges of $3,200. Special handling instructions: Handle with care - fragile goods. The vessel is MV Atlantic Star with voyage number 2024-001. Port of loading is Los Angeles, USA and port of discharge is Hamburg, Germany. The carrier is Ocean Express Lines. This shipment is scheduled for departure on March 15, 2024 and expected arrival on April 2, 2024."

echo "🚀 Testing RAG Pipeline..."
echo ""

# Test 1: Ingest document
echo "📄 Step 1: Ingesting document..."
INGEST_RESPONSE=$(curl -s -X POST "$BASE_URL/ingest" \
  -H "Content-Type: application/json" \
  -d "{\"docId\":\"$DOC_ID\",\"text\":\"$SAMPLE_TEXT\",\"meta\":{\"type\":\"bill_of_lading\",\"date\":\"2024-03-15\"}}")

echo "Response: $INGEST_RESPONSE"
echo ""

# Wait a moment for processing
sleep 2

# Test 2: Search for relevant chunks
echo "🔍 Step 2: Searching for relevant chunks..."
SEARCH_RESPONSE=$(curl -s -X POST "$BASE_URL/search" \
  -H "Content-Type: application/json" \
  -d "{\"docId\":\"$DOC_ID\",\"query\":\"freight rate and charges\"}")

echo "Response: $SEARCH_RESPONSE"
echo ""

# Test 3: Analyze with streaming
echo "🤖 Step 3: Analyzing with AI (streaming response)..."
echo "User Prompt: What are the key financial details of this shipment?"
echo ""

curl -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d "{\"userPrompt\":\"What are the key financial details of this shipment?\",\"docId\":\"$DOC_ID\",\"query\":\"financial details charges rates\"}" \
  --no-buffer

echo ""
echo ""
echo "✅ RAG Pipeline test completed!"
echo ""
echo "📋 Summary:"
echo "- Document ingested and chunked"
echo "- Vector search performed"
echo "- AI analysis streamed"
echo ""
echo "🔧 To test manually:"
echo "1. Ingest: curl -X POST $BASE_URL/ingest -H 'Content-Type: application/json' -d '{\"docId\":\"test\",\"text\":\"your document text\"}'"
echo "2. Search: curl -X POST $BASE_URL/search -H 'Content-Type: application/json' -d '{\"docId\":\"test\",\"query\":\"your search query\"}'"
echo "3. Analyze: curl -X POST $BASE_URL/analyze -H 'Content-Type: application/json' -d '{\"userPrompt\":\"your question\",\"docId\":\"test\",\"query\":\"search query\"}'"
