#!/bin/bash
set -e

API_URL=${API_URL:-http://localhost:5001}
WEB_URL=${WEB_URL:-http://localhost:3000}

echo "🧪 Testing Ralph Dashboard..."
echo ""

# API tests
echo "📡 API Endpoints..."
echo -n "  Health: "
curl -sf $API_URL/api/health > /dev/null && echo "✓" || echo "✗"

echo -n "  Metrics: "
curl -sf $API_URL/api/metrics/overview > /dev/null && echo "✓" || echo "✗"

echo -n "  Sessions: "
curl -sf $API_URL/api/sessions > /dev/null && echo "✓" || echo "✗"

echo -n "  Tasks Board: "
curl -sf $API_URL/api/tasks/board > /dev/null && echo "✓" || echo "✗"

echo -n "  Agents: "
curl -sf $API_URL/api/agents > /dev/null && echo "✓" || echo "✗"

echo -n "  Agent Stats: "
curl -sf $API_URL/api/agents/stats > /dev/null && echo "✓" || echo "✗"

echo -n "  Approvals: "
curl -sf $API_URL/api/approvals > /dev/null && echo "✓" || echo "✗"

echo -n "  Repositories: "
curl -sf $API_URL/api/repositories > /dev/null && echo "✓" || echo "✗"

echo -n "  GitHub Issues: "
curl -sf $API_URL/api/github/issues > /dev/null && echo "✓" || echo "✗"

echo -n "  Workflow Transcripts: "
curl -sf $API_URL/api/workflow/transcripts > /dev/null && echo "✓" || echo "✗"

echo ""

# Web tests
echo "🌐 Web Pages..."
echo -n "  Dashboard: "
curl -sf $WEB_URL/dashboard > /dev/null && echo "✓" || echo "✗"

echo -n "  Board: "
curl -sf $WEB_URL/board > /dev/null && echo "✓" || echo "✗"

echo -n "  Sessions: "
curl -sf $WEB_URL/sessions > /dev/null && echo "✓" || echo "✗"

echo -n "  Agents: "
curl -sf $WEB_URL/agents > /dev/null && echo "✓" || echo "✗"

echo -n "  Approvals: "
curl -sf $WEB_URL/approvals > /dev/null && echo "✓" || echo "✗"

echo -n "  Issues: "
curl -sf $WEB_URL/issues > /dev/null && echo "✓" || echo "✗"

echo -n "  Repositories: "
curl -sf $WEB_URL/repositories > /dev/null && echo "✓" || echo "✗"

echo ""

# Edge case tests
echo "🔍 Edge Cases..."

echo -n "  Session validation: "
RESP=$(curl -s -w "HTTP:%{http_code}" -X POST $API_URL/api/sessions -H "Content-Type: application/json" -d '{}')
[[ "$RESP" == *"HTTP:400"* ]] && echo "✓" || echo "✗ (expected 400)"

echo -n "  Approval validation: "
RESP=$(curl -s -w "HTTP:%{http_code}" -X POST $API_URL/api/approvals -H "Content-Type: application/json" -d '{}')
[[ "$RESP" == *"HTTP:400"* ]] && echo "✓" || echo "✗ (expected 400)"

echo -n "  Agent validation: "
RESP=$(curl -s -w "HTTP:%{http_code}" -X POST $API_URL/api/agents -H "Content-Type: application/json" -d '{}')
[[ "$RESP" == *"HTTP:400"* ]] && echo "✓" || echo "✗ (expected 400)"

echo -n "  Non-existent session: "
RESP=$(curl -s -w "HTTP:%{http_code}" $API_URL/api/sessions/nonexistent)
[[ "$RESP" == *"HTTP:404"* ]] && echo "✓" || echo "✗ (expected 404)"

echo -n "  Non-existent workflow: "
RESP=$(curl -s -w "HTTP:%{http_code}" $API_URL/api/workflow/sessions/nonexistent)
[[ "$RESP" == *"HTTP:404"* ]] && echo "✓" || echo "✗ (expected 404)"

echo ""
echo "✅ All tests completed!"
