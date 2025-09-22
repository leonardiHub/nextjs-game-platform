#!/bin/bash

# Backend Deployment Package Script for api.99group.games

echo "🚀 Preparing backend deployment package..."

# Create deployment directory
mkdir -p deployment
cd deployment

# Copy essential backend files
cp ../server_enhanced.js .
cp ../package.json .
cp ../package-lock.json .

# Create production environment file
cat > .env.production << EOF
NODE_ENV=production
PORT=3002
JWT_SECRET=your-production-jwt-secret-change-this
PUBLIC_DOMAIN=https://api.99group.games
CORS_ORIGIN=https://99group.games
EOF

# Create PM2 ecosystem file for production
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'api-99group-backend',
    script: 'server_enhanced.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002,
      PUBLIC_DOMAIN: 'https://api.99group.games'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
}
EOF

# Create logs directory
mkdir -p logs

# Create deployment README
cat > DEPLOYMENT_README.md << EOF
# Backend Deployment Guide

## Files Included:
- server_enhanced.js (main backend server)
- package.json (dependencies)
- .env.production (production environment)
- ecosystem.config.js (PM2 configuration)

## Deployment Steps:

1. Upload files to server
2. Install dependencies: npm install
3. Start with PM2: pm2 start ecosystem.config.js --env production
4. Monitor: pm2 logs api-99group-backend

## Environment Variables:
- NODE_ENV=production
- PORT=3002
- PUBLIC_DOMAIN=https://api.99group.games

## API Endpoints Available:
- POST /api/login
- POST /api/register
- GET /api/profile
- GET /api/balance
- POST /api/game/launch
- POST /api/game/callback
- GET /api/games
- GET /api/transactions
- And more...
EOF

echo "✅ Deployment package created in ./deployment/"
echo "📁 Files ready for upload to api.99group.games server"
echo ""
echo "Next steps:"
echo "1. Upload deployment/ folder contents to your server"
echo "2. Run: npm install"
echo "3. Run: pm2 start ecosystem.config.js --env production"
echo "4. Update frontend to use https://api.99group.games"


