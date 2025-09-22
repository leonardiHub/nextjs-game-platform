#!/bin/bash

# Production startup script for 99Group Game Platform
# This script starts the platform with production configuration

echo "🚀 Starting 99Group Game Platform in Production Mode..."

# Set production environment variables
export NODE_ENV=production
export PORT=3002
export PUBLIC_DOMAIN=https://99group.games

# Display configuration
echo "📋 Production Configuration:"
echo "   - Environment: $NODE_ENV"
echo "   - Port: $PORT"
echo "   - Domain: $PUBLIC_DOMAIN"
echo "   - Callback URL: $PUBLIC_DOMAIN/api/game/callback"
echo ""

# Check if Next.js build exists
if [ ! -d ".next" ]; then
    echo "⚠️  Next.js build not found. Building..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Exiting..."
        exit 1
    fi
    echo "✅ Build completed"
fi

# Start the server
echo "🎮 Starting game platform server..."
node server_enhanced.js
