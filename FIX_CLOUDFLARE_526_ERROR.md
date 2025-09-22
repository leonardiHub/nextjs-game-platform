# 🔒 Fix Cloudflare Error 526 - Invalid SSL Certificate

## 🔍 **Problem Analysis**

**Error 526** means Cloudflare cannot validate the SSL certificate on your **origin server** (the server behind Cloudflare).

### **DNS Status:**
- ✅ `api.99group.games` → `172.67.153.85, 104.21.72.176` (Cloudflare IPs)
- ✅ `99group.games` → `172.67.153.85, 104.21.72.176` (Same IPs)
- ✅ Both domains resolve correctly

### **Issue**: Origin server SSL configuration for the subdomain

---

## 🛠️ **Solutions to Fix Error 526**

### **Solution 1: Configure Cloudflare SSL Settings**

#### **Step 1: Access Cloudflare Dashboard**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your **99group.games** domain
3. Navigate to **SSL/TLS** tab

#### **Step 2: Check SSL/TLS Encryption Mode**
Current setting might be **"Full (Strict)"** which requires valid SSL on origin.

**Change to**: **"Full"** (not strict)
- **Full**: Encrypts connection but doesn't validate origin certificate
- **Flexible**: HTTP to origin (less secure)
- **Full (Strict)**: Requires valid SSL on origin (current issue)

#### **Step 3: Check Origin Server Configuration**
Go to **SSL/TLS** → **Origin Server**
- Create **Origin Certificate** if none exists
- Download and install on your server

### **Solution 2: Create Cloudflare Origin Certificate**

#### **Step 1: Generate Origin Certificate**
1. **Cloudflare Dashboard** → **SSL/TLS** → **Origin Server**
2. Click **"Create Certificate"**
3. **Hostnames**: Add `api.99group.games, *.99group.games`
4. **Key Type**: RSA (2048)
5. **Certificate Validity**: 15 years
6. Click **"Create"**

#### **Step 2: Install on Origin Server**
```bash
# Save certificate as /etc/ssl/certs/99group.pem
# Save private key as /etc/ssl/private/99group.key

# For Nginx:
server {
    listen 443 ssl;
    server_name api.99group.games;
    
    ssl_certificate /etc/ssl/certs/99group.pem;
    ssl_certificate_key /etc/ssl/private/99group.key;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# For Apache:
<VirtualHost *:443>
    ServerName api.99group.games
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/99group.pem
    SSLCertificateKeyFile /etc/ssl/private/99group.key
    
    ProxyPass / http://localhost:3002/
    ProxyPassReverse / http://localhost:3002/
</VirtualHost>
```

### **Solution 3: DNS Record Configuration**

#### **Check DNS Records in Cloudflare:**
1. **DNS** tab in Cloudflare dashboard
2. Verify **api.99group.games** record exists:
   ```
   Type: A or CNAME
   Name: api
   Content: Your server IP or main domain
   Proxy Status: Proxied (orange cloud)
   ```

### **Solution 4: Temporary Workaround**

#### **Use Working Domain:**
Since `99group.games` works perfectly, you can:

1. **Deploy backend** to main domain with path prefix:
   ```
   https://99group.games/backend/api/*
   ```

2. **Update frontend** to use main domain:
   ```typescript
   const BACKEND_URL = 'https://99group.games/backend'
   ```

---

## 🧪 **Testing Commands**

### **Test SSL Configuration:**
```bash
# Check SSL certificate details
openssl s_client -connect api.99group.games:443 -servername api.99group.games

# Test with curl (verbose)
curl -I https://api.99group.games/ -v

# Check if origin responds on HTTP
curl -I http://api.99group.games/ -v
```

### **Test After Fix:**
```bash
# Should return 200 OK instead of 526
curl -I https://api.99group.games/

# Test API endpoint
curl https://api.99group.games/api/games
```

---

## 🎯 **Quick Fix Steps (Recommended)**

### **Option A: Change SSL Mode (Fastest)**
1. **Cloudflare Dashboard** → **SSL/TLS** 
2. **Change from** "Full (Strict)" **to** "Full"
3. **Wait 2-3 minutes** for propagation
4. **Test**: `curl -I https://api.99group.games/`

### **Option B: Use Main Domain (Immediate)**
- ✅ Already configured in your frontend
- ✅ Uses `https://99group.games/api/*`
- ✅ Working immediately

---

## 📞 **Need Help?**

If you have access to the Cloudflare dashboard, try **Option A** first. If not, **Option B** (main domain) is already working and ready to use!

**The fastest solution is to change Cloudflare SSL mode from "Full (Strict)" to "Full".** 🚀


