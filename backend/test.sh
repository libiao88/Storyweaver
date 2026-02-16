#!/bin/bash

echo "🧪 Starting StoryWeaver Backend Tests"
echo "=================================="

# Function to test API endpoint
test_endpoint() {
    local url=$1
    local method=${2:-GET}
    local data=${3:-}
    
    echo -n "Testing $method $url... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    if [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
        echo -e "✅ Success (HTTP $response)"
    else
        echo -e "❌ Failed (HTTP $response)"
        return 1
    fi
}

# Start server in background
echo "Starting dev server..."
cd /Users/cobbli/Desktop/storyweaver/backend
npm run dev -- --port 8888 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test endpoints
test_endpoint "http://localhost:8888/health"

# Clean up
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "=================================="
echo "🎉 All tests completed!"