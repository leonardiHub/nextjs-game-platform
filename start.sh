#!/bin/bash

# Start the game platform with both Next.js frontend and Express backend

echo "🚀 Starting 99Group Game Platform..."
echo ""

# Kill existing processes
echo "🔄 Stopping existing processes..."
pkill -f "next dev" || true
pkill -f "server_enhanced.js" || true
sleep 2

# Start backend server in background
echo "🖥️  Starting backend server on port 3068..."
node server_enhanced.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server on port 3000..."
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3068"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    pkill -f "next dev" || true
    echo "✅ All servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM EXIT

# Start frontend (this will run in foreground)
npm run dev:next

