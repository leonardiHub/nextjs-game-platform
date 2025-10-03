# 🚀 Port Configuration Guide

This project can be hosted on any port by modifying the configuration files.

## Current Configuration (Updated)
- **Frontend (Next.js):** Port 8080
- **Backend (Express):** Port 8081

## How to Change Ports

### Method 1: Environment Variables (Recommended)

Create a `.env.local` file in the project root:

```bash
# Frontend Port
NEXT_PORT=8080

# Backend Port  
PORT=8081

# Public Domain (for production)
PUBLIC_DOMAIN=https://your-domain.com
```

### Method 2: Direct Configuration Changes

#### Frontend Port (Next.js)
1. **package.json** - Update the dev script:
   ```json
   "dev": "concurrently \"npm run server\" \"next dev --turbopack -p 8080\""
   ```

2. **src/utils/config.ts** - Update FRONTEND_URL:
   ```typescript
   FRONTEND_URL: 'http://localhost:8080'
   ```

#### Backend Port (Express)
1. **server_enhanced.js** - Update PORT:
   ```javascript
   const PORT = process.env.PORT || 8081
   ```

2. **src/utils/config.ts** - Update BASE_URL:
   ```typescript
   BASE_URL: 'http://localhost:8081'
   ```

## Running the Project

### Development Mode
```bash
npm run dev
```
This will start both frontend (port 8080) and backend (port 8081) simultaneously.

### Production Mode
```bash
npm run build
npm run start
```

### Individual Services
```bash
# Frontend only
npm run dev:next

# Backend only  
npm run dev:server
```

## Port Examples

### Common Port Configurations

| Frontend | Backend | Use Case |
|----------|---------|----------|
| 3000 | 3001 | Default Next.js setup |
| 8080 | 8081 | Current configuration |
| 4000 | 4001 | Alternative setup |
| 5000 | 5001 | Alternative setup |
| 80 | 3000 | Production (with reverse proxy) |
| 443 | 3000 | Production HTTPS |

### Custom Port Setup

To use custom ports (e.g., 9000 for frontend, 9001 for backend):

1. **Update package.json:**
   ```json
   "dev": "concurrently \"npm run server\" \"next dev --turbopack -p 9000\""
   ```

2. **Update server_enhanced.js:**
   ```javascript
   const PORT = process.env.PORT || 9001
   ```

3. **Update src/utils/config.ts:**
   ```typescript
   BASE_URL: 'http://localhost:9001'
   FRONTEND_URL: 'http://localhost:9000'
   ```

## Environment Variables

You can also use environment variables to override ports:

```bash
# Set ports via environment variables
NEXT_PORT=9000 PORT=9001 npm run dev
```

## Production Deployment

For production, set these environment variables:

```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://your-api-domain.com
PUBLIC_DOMAIN=https://your-frontend-domain.com
```

## Troubleshooting

### Port Already in Use
If you get "port already in use" error:

1. **Find the process using the port:**
   ```bash
   lsof -i :8080
   lsof -i :8081
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```

3. **Or use a different port**

### CORS Issues
If you encounter CORS issues, make sure the frontend URL in the backend matches your frontend port.

## Verification

After changing ports, verify the configuration:

1. **Check if services are running:**
   ```bash
   curl http://localhost:8080  # Frontend
   curl http://localhost:8081/api/health  # Backend
   ```

2. **Check the browser:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8081/api

## Notes

- The project uses SQLite database, so no database port configuration is needed
- All file uploads are handled locally
- The configuration is designed to work both in development and production
- Make sure to update all references to the old ports when changing
