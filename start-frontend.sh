#!/bin/bash

echo "🌐 Starting Okahandja Municipality Frontend..."
echo ""
echo "   Frontend will run on: http://localhost:8080"
echo ""
echo "⚠️  Keep this terminal window open!"
echo "   Press Ctrl+C to stop the server"
echo ""
echo "📱 Opening browser in 3 seconds..."
sleep 3
open http://localhost:8080
echo ""

python3 -m http.server 8080
