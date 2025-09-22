#!/bin/bash

# Simple deployment script for 99Group Game Platform
# This script deploys the current nextjs-game-platform to replace game-staging

echo "🚀 Deploying NextJS Game Platform to 99group.games..."

# Configuration
PROJECT_DIR="/home/ubuntu/game-platform01/nextjs-game-platform"
STAGING_DIR="/home/ubuntu/game-platform01/game-staging"

# Stop existing game-staging services
echo "🛑 Stopping existing game-staging services..."
sudo pkill -f "server_enhanced.js" 2>/dev/null || true
sudo pm2 stop all 2>/dev/null || true

# Build Next.js frontend
echo "🔨 Building Next.js frontend..."
cd $PROJECT_DIR
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Exiting..."
    exit 1
fi

# Copy built assets to public directory for server to serve
echo "📁 Copying built assets..."
cp -r .next/static/* public/ 2>/dev/null || true

# Update server configuration for production
echo "⚙️  Updating server configuration..."
export NODE_ENV=production
export PORT=3002
export PUBLIC_DOMAIN=https://99group.games

# Start the enhanced server
echo "🎮 Starting game platform server..."
cd $PROJECT_DIR

# Start with PM2 for production
pm2 start ecosystem.production.js

# Save PM2 configuration
pm2 save

echo ""
echo "🎉 Deployment completed!"
echo "=================================="
echo ""
echo "📋 Service Status:"
pm2 status
echo ""
echo "🌐 Platform Access:"
echo "   🎮 Main site: https://99group.games"
echo "   🔧 Admin panel: https://99group.games/admin"
echo ""
echo "📊 Monitor logs:"
echo "   📋 PM2 logs: pm2 logs 99group-game-platform"
echo "   📋 Error logs: tail -f /home/ubuntu/logs/99group-platform-error.log"
echo ""
