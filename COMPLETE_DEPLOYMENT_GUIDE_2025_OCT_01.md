# 🚀 Complete Production Deployment Guide

## 📋 **Overview**

This guide covers the complete deployment of the 99Group Gaming Platform, including all fixes and configurations for production use.

**Architecture:**
- **Frontend**: `https://99group.games` (Next.js application)
- **Backend**: `https://api.99group.games` (Express server)
- **Admin Panel**: Integrated within Next.js application

---

## 🔧 **Prerequisites**

### **Server Requirements:**
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ and npm
- Nginx web server
- PM2 process manager
- SSL certificates (Let's Encrypt recommended)

### **Domain Setup:**
- `99group.games` - Main frontend domain
- `api.99group.games` - Backend API domain

---

## 🏗️ **Backend Deployment**

### **Step 1: Deploy Express Server**

#### **Files Structure:**
```
deployment/
├── server_enhanced.js          # Main backend server
├── package.json                # Dependencies
├── .env.production            # Production environment variables
├── ecosystem.config.js        # PM2 configuration
└── DEPLOYMENT_README.md       # Additional instructions
```

#### **Deployment Commands:**
```bash
# 1. Upload deployment folder to your server
scp -r deployment/* user@api.99group.games:/path/to/backend/

# 2. SSH into your server
ssh user@api.99group.games

# 3. Install dependencies
npm install

# 4. Start with PM2
pm2 start ecosystem.config.js --env production

# 5. Monitor logs
pm2 logs api-99group-backend
```

### **Step 2: Environment Configuration**

#### **Backend Environment Variables (.env.production):**
```env
NODE_ENV=production
PORT=3002
JWT_SECRET=your-production-jwt-secret-change-this
PUBLIC_DOMAIN=https://api.99group.games
CORS_ORIGIN=https://99group.games
```

---

## 🎨 **Frontend Deployment**

### **Step 1: Deploy Next.js Application**

#### **Deployment Commands:**
```bash
# 1. Build the application
npm run build

# 2. Start in production mode with correct JWT secret
JWT_SECRET=your-production-jwt-secret-change-this NODE_ENV=production npm run start
```

### **Step 2: Nginx Configuration**

#### **Critical Nginx Configuration:**
The nginx configuration must route admin API requests to Next.js and other API requests to Express:

```nginx
# Admin API routes - proxy to Next.js (port 3000)
location /api/admin/ {
    proxy_pass http://localhost:3000/api/admin/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # API timeout settings
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
    
    # Disable caching for API responses
    proxy_no_cache 1;
    proxy_cache_bypass 1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    
    # CORS configuration
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    
    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}

# Other API routes - proxy to backend (port 3002)
location /api/ {
    proxy_pass http://localhost:3006/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # API timeout settings
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
    
    # Disable caching for API responses
    proxy_no_cache 1;
    proxy_cache_bypass 1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    
    # CORS configuration
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    
    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}

# Main site - proxy to Next.js frontend (port 3000)
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Next.js optimization
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    proxy_buffering off;
}
```

### **Step 3: Apply Nginx Configuration**

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 🔐 **JWT Secret Configuration**

### **Critical Fix: JWT Secret Synchronization**

Both the Express server and Next.js application must use the same JWT secret:

#### **Express Server (server_enhanced.js):**
```javascript
const JWT_SECRET = 'your-production-jwt-secret-change-this'
```

#### **Next.js API Routes:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
```

#### **Environment Variable:**
```bash
export JWT_SECRET=your-production-jwt-secret-change-this
```

---

## 🧪 **Testing & Verification**

### **Test Backend Endpoints:**
```bash
# Test login
curl -X POST https://api.99group.games/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test games list
curl https://api.99group.games/api/games
```

### **Test Frontend Admin API:**
```bash
# Get admin token
TOKEN=$(curl -X POST https://api.99group.games/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -s | jq -r '.token')

# Test game library providers
curl -X GET https://99group.games/api/admin/game-library-providers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Test creating a provider
curl -X POST https://99group.games/api/admin/game-library-providers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Provider", "code": "TEST", "description": "Test description", "status": "active"}'
```

### **Test Game Provider Management:**
1. Navigate to `https://99group.games/admin`
2. Login with admin credentials
3. Go to Game Provider Management
4. Test creating, editing, and deleting providers

---

## 📊 **Monitoring & Maintenance**

### **PM2 Commands:**
```bash
pm2 status                    # Check status
pm2 logs api-99group-backend  # View logs
pm2 restart api-99group-backend # Restart
pm2 stop api-99group-backend   # Stop
pm2 delete api-99group-backend # Remove
```

### **Application Monitoring:**
```bash
# Check Next.js process
ps aux | grep "next-server"

# Check Express process
ps aux | grep "server_enhanced"

# Check nginx status
sudo systemctl status nginx
```

### **Log Files:**
- Next.js logs: `nextjs.log`
- PM2 logs: `pm2 logs api-99group-backend`
- Nginx logs: `/var/log/nginx/error.log`

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions:**

#### **1. 404 Error on Admin API:**
- **Cause**: Nginx routing issue
- **Solution**: Ensure admin API routes are configured to proxy to Next.js (port 3000)

#### **2. 401 Unauthorized on Admin API:**
- **Cause**: JWT secret mismatch
- **Solution**: Ensure both Express and Next.js use the same JWT secret

#### **3. Port Already in Use:**
- **Cause**: Previous process still running
- **Solution**: Kill existing processes and restart

```bash
pkill -f "next start"
pkill -f "server_enhanced.js"
```

#### **4. Database Connection Issues:**
- **Cause**: SQLite database not accessible
- **Solution**: Check file permissions and database path

---

## ✅ **Deployment Checklist**

### **Backend:**
- [ ] Express server deployed to api.99group.games
- [ ] SSL certificate configured
- [ ] Database uploaded and accessible
- [ ] PM2 process running
- [ ] Environment variables set
- [ ] CORS configured for 99group.games

### **Frontend:**
- [ ] Next.js application built and running
- [ ] JWT_SECRET environment variable set
- [ ] Nginx configuration updated
- [ ] Admin API routes working
- [ ] Game Provider Management functional

### **Testing:**
- [ ] Backend API endpoints responding
- [ ] Frontend admin authentication working
- [ ] Game provider CRUD operations working
- [ ] All API routes properly routed

---

## 🎯 **Final Architecture**

After successful deployment:

```
Internet
    ↓
Cloudflare (Optional)
    ↓
Nginx (99group.games)
    ├── /api/admin/* → Next.js (port 3000)
    ├── /api/* → Express (port 3002)
    └── /* → Next.js (port 3000)
```

**Key Features Working:**
- ✅ User authentication and registration
- ✅ Game library and provider management
- ✅ Admin panel with full CRUD operations
- ✅ Game integration and callbacks
- ✅ Transaction management
- ✅ Responsive design and modern UI

---

## 📞 **Support**

For issues or questions:
1. Check the troubleshooting section above
2. Review logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all services are running and accessible

**Your 99Group Gaming Platform is now fully operational!** 🎮🚀
