# 🚀 Deploy Next.js Code to 99group.games

## 📋 **Deployment Preparation**

### **Current Status:**
- ✅ **Enhanced Navbar**: Dark theme with Lucide icons
- ✅ **HUIDU API**: Complete implementation with AES encryption
- ✅ **Backend Integration**: All API routes configured
- ✅ **Prettier**: Code formatting configured
- ✅ **Tailwind CSS**: Fixed utility classes

### **Your Enhanced Features:**
- **Professional Dark Navbar**: Logo | Hi,demo | Credit: $XXX | Withdrawal | Logout
- **Sticky Navigation**: Stays at top when scrolling
- **Lucide React Icons**: No emojis, professional appearance
- **Complete HUIDU API**: All 4 endpoints implemented
- **AES Encryption**: Full encryption/decryption support
- **Responsive Design**: Mobile and desktop optimized

---

## 🛠️ **Deployment Methods**

### **Method 1: Build and Upload (Recommended)**

#### **Step 1: Create Production Build**
```bash
cd /home/ubuntu/game-platform01/nextjs-game-platform
npm run build
```

#### **Step 2: Upload Built Files**
```bash
# Upload .next/static and .next/standalone to server
scp -r .next/static/* user@99group.games:/var/www/99group.games/static/
scp -r .next/standalone/* user@99group.games:/var/www/99group.games/
```

### **Method 2: Git Deployment**

#### **Step 1: Initialize Git Repository**
```bash
git init
git add .
git commit -m "Enhanced Next.js game platform with dark navbar and HUIDU API"
```

#### **Step 2: Push to Production**
```bash
# Add production remote
git remote add production user@99group.games:/path/to/repo.git

# Push to production
git push production main
```

### **Method 3: PM2 Deployment**

#### **Step 1: Create PM2 Ecosystem**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: '99group-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/nextjs-app',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### **Step 2: Deploy with PM2**
```bash
pm2 start ecosystem.config.js --env production
```

---

## 📦 **Create Deployment Package**


