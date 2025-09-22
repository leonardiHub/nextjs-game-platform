# 🔒 SSL Certificate Issue Solutions

## ⚠️ **Problem: Error 526 - Invalid SSL Certificate**

The `https://api.99group.games` subdomain is returning a **Cloudflare 526 error**, which means:
- ✅ Cloudflare can reach the subdomain
- ❌ The origin server behind Cloudflare has SSL issues

---

## 🛠️ **Solution Options**

### **Option 1: Use Main Domain (Recommended)**

Since `https://99group.games` works perfectly, update your backend to use the main domain:

```javascript
// Update all API routes to use main domain
const BACKEND_URL = 'https://99group.games'
```

**Benefits:**
- ✅ SSL certificate already working
- ✅ No additional server setup needed
- ✅ Immediate deployment possible

### **Option 2: Fix api.99group.games SSL**

If you need the subdomain, fix the SSL configuration:

#### **Cloudflare Settings:**
1. **Go to**: Cloudflare Dashboard → 99group.games
2. **SSL/TLS Tab** → Overview
3. **Set SSL Mode**: Full (Strict) or Full
4. **Origin Certificates**: Create origin certificate for your server

#### **Server Configuration:**
```bash
# Install SSL certificate on origin server
# Configure Nginx/Apache to use the certificate
# Ensure origin server responds on HTTPS
```

### **Option 3: Use Different Port/Path**

Deploy backend to main domain with different path:
```
https://99group.games/api/backend/*
```

---

## 🚀 **Recommended Immediate Solution**

Since you need to deploy quickly, I recommend **updating to use the main domain**:

### **Update Frontend API URLs:**
```typescript
// Instead of: https://api.99group.games
// Use: https://99group.games
```

### **Backend Deployment:**
Deploy your backend to the same server that handles `99group.games`

---

## 🔧 **Quick Fix Implementation**

Let me update your frontend to use the working domain:


