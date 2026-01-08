#!/bin/bash

echo "🏛️  Starting Okahandja Municipality Backend API..."
echo ""

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first time only)..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
fi

echo ""
echo "🚀 Starting backend server..."
echo "   Backend will run on: http://localhost:3000"
echo ""
echo "⚠️  Keep this terminal window open!"
echo "   Press Ctrl+C to stop the server"
echo ""

npm run dev
