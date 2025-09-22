# 🚀 Production Deployment Guide

## 📋 **Backend Deployment to api.99group.games**

### **Step 1: Deploy Backend**

#### **Files Ready in `./deployment/` folder:**
- `server_enhanced.js` - Main backend server
- `package.json` - Dependencies
- `.env.production` - Production environment variables
- `ecosystem.config.js` - PM2 configuration
- `DEPLOYMENT_README.md` - Deployment instructions

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

### **Step 2: Frontend Configuration Updated**

#### **✅ All API Routes Updated:**
Your frontend API routes now point to production:

- **Login**: `https://api.99group.games/api/login`
- **Register**: `https://api.99group.games/api/register`
- **Profile**: `https://api.99group.games/api/profile`
- **Balance**: `https://api.99group.games/api/balance`
- **Games**: `https://api.99group.games/api/games`
- **Transactions**: `https://api.99group.games/api/transactions`
- **Withdrawal**: `https://api.99group.games/api/withdrawal/*`
- **Game Launch**: `https://api.99group.games/api/game/launch`
- **Game Callback**: `https://api.99group.games/api/game/callback`
- **Game APIs**: `https://api.99group.games/api/game/*`

### **Step 3: Environment Configuration**

#### **Production Environment Variables:**
```env
NODE_ENV=production
PORT=3002
JWT_SECRET=your-production-jwt-secret-change-this
PUBLIC_DOMAIN=https://api.99group.games
CORS_ORIGIN=https://99group.games
```

#### **Frontend Environment:**
```env
NEXT_PUBLIC_API_URL=https://api.99group.games
NEXT_PUBLIC_FRONTEND_URL=https://99group.games
```

---

## 🧪 **Testing Production Connection**

### **Test Backend Endpoints:**
```bash
# Test login
curl -X POST https://api.99group.games/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"test"}'

# Test games list
curl https://api.99group.games/api/games

# Test callback (encrypted)
curl -X POST https://api.99group.games/api/game/callback \
  -H "Content-Type: application/json" \
  -d '{
    "agency_uid": "45370b4f27dfc8a2875ba78d07e8a81a",
    "timestamp": "'$(date +%s)'000",
    "payload": "encrypted_data"
  }'
```

### **Test Frontend Connection:**
```bash
# Test frontend API proxy
curl http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"test"}'
```

---

## 🔐 **Security Considerations**

### **SSL/HTTPS Setup:**
- ✅ Backend must have valid SSL certificate for `api.99group.games`
- ✅ CORS configured to allow requests from `99group.games`
- ✅ Environment variables secured

### **Database Migration:**
- Copy `game_platform.db` to production server
- Ensure proper file permissions
- Backup database regularly

### **API Keys:**
- Update JWT_SECRET for production
- Verify HUIDU API keys are correct
- Test AES encryption/decryption

---

## 📊 **Monitoring & Logs**

### **PM2 Commands:**
```bash
pm2 status                    # Check status
pm2 logs api-99group-backend  # View logs
pm2 restart api-99group-backend # Restart
pm2 stop api-99group-backend   # Stop
pm2 delete api-99group-backend # Remove
```

### **Health Check Endpoint:**
```bash
curl https://api.99group.games/api/games
# Should return: {"success":true,"games":{...}}
```

---

## ✅ **Deployment Checklist**

- [ ] Backend deployed to api.99group.games
- [ ] SSL certificate configured
- [ ] Database uploaded and accessible
- [ ] PM2 process running
- [ ] Environment variables set
- [ ] CORS configured for 99group.games
- [ ] Frontend API routes updated
- [ ] Test all endpoints working
- [ ] Game callback working with encryption
- [ ] User authentication working

---

## 🎯 **Final Result**

After deployment:
- **Frontend**: `https://99group.games` (your Next.js app)
- **Backend**: `https://api.99group.games` (your Express server)
- **Game Callback**: `https://api.99group.games/api/game/callback`

**Your game platform will be fully operational with production backend!** 🎮🚀


