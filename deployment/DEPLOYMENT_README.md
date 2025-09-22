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
