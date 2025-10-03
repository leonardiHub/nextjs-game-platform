# FUN88 Standalone Project Setup

This project has been completely decoupled from 99group.games and is now a standalone application.

## 🚀 Key Changes Made

### 1. API Configuration
- **Frontend URL**: `https://fun88tha.com` (instead of 99group.games)
- **API URL**: `https://api-staging.4d99.co` (instead of api.99group.games)
- **Backend Port**: 3001 (instead of 3002)

### 2. Database Separation
- **Database File**: `fun88_platform.db` (instead of game_platform.db)
- **Player Prefix**: `fun88` (instead of h4944d)
- **JWT Secret**: `fun88-secret-key-change-in-production`

### 3. Game Provider Configuration
- **Agency UID**: `8dee1e401b87408cca3ca813c2250cb4`
- **AES Key**: `68b074393ec7c5a975856a90bd6fdf47`
- **Server URL**: `https://jsgame.live`

### 4. PM2 Configuration
- **Frontend Process**: `fun88-v1-frontend` (port 3010)
- **Backend Process**: `fun88-v1-backend` (port 3001)
- **Separate Log Files**: frontend-*.log and backend-*.log

## 📁 Files Modified

1. `src/utils/config.ts` - API endpoints updated
2. `server_enhanced.js` - Backend configuration updated
3. `src/app/api/admin/settings/route.ts` - Database path updated
4. `ecosystem.config.js` - PM2 configuration updated
5. `next.config.js` - Backend port updated
6. `deployment/server_enhanced.js` - Deployment config updated
7. `deployment/ecosystem.config.js` - Deployment PM2 config updated

## 🔧 Environment Variables

```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=fun88-secret-key-change-in-production
PUBLIC_DOMAIN=https://api-staging.4d99.co
CORS_ORIGIN=https://fun88tha.com
NEXT_PUBLIC_API_URL=https://api-staging.4d99.co
NEXT_PUBLIC_FRONTEND_URL=https://fun88tha.com
```

## 🚀 Deployment Commands

### Start Both Services
```bash
pm2 start ecosystem.config.js
```

### Start Individual Services
```bash
# Frontend only
pm2 start ecosystem.config.js --only fun88-v1-frontend

# Backend only  
pm2 start ecosystem.config.js --only fun88-v1-backend
```

### Monitor Services
```bash
pm2 logs fun88-v1-frontend
pm2 logs fun88-v1-backend
pm2 status
```

## 📊 Database

The project now uses its own SQLite database (`fun88_platform.db`) with the same schema but completely separate data from 99group.games.

## ✅ Verification

To verify the project is standalone:

1. Check API calls go to `https://api-staging.4d99.co` instead of 99group.games
2. Verify database file is `fun88_platform.db`
3. Confirm player accounts use `fun88` prefix
4. Check PM2 processes are running independently

## 🔒 Security

- Separate JWT secrets
- Independent database
- Isolated game provider configuration
- No shared resources with 99group.games

---

**Status**: ✅ COMPLETELY STANDALONE
**Last Updated**: $(date)
**Separated From**: 99group.games
