# 🌐 Cloudflare DNS Configuration for fun88.game

This guide will help you configure Cloudflare DNS settings for your fun88.game domain.

## 📋 Prerequisites

1. Domain `fun88.game` registered and added to Cloudflare
2. Server IP address: `15.235.215.3` (or your server's public IP)
3. SSL certificates configured on the server

## 🔧 Cloudflare DNS Configuration

### Step 1: Add DNS Records

In your Cloudflare dashboard for `fun88.game`, add the following DNS records:

#### A Records (IPv4)
```
Type: A
Name: @
Content: 15.235.215.3
Proxy status: ✅ Proxied (Orange Cloud)
TTL: Auto
```

```
Type: A
Name: www
Content: 15.235.215.3
Proxy status: ✅ Proxied (Orange Cloud)
TTL: Auto
```

#### CNAME Records (if needed)
```
Type: CNAME
Name: api
Content: fun88.game
Proxy status: ❌ DNS only (Gray Cloud)
TTL: Auto
```

### Step 2: SSL/TLS Configuration

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to: **Full (Strict)**
3. Enable **Always Use HTTPS**
4. Enable **HTTP Strict Transport Security (HSTS)**

### Step 3: Security Settings

#### SSL/TLS Settings
- **Encryption Mode**: Full (Strict)
- **Edge Certificates**: 
  - ✅ Always Use HTTPS
  - ✅ HTTP Strict Transport Security (HSTS)
  - ✅ Minimum TLS Version: 1.2

#### Security Level
- Set to **Medium** or **High**

#### Firewall Rules (Optional)
Create rules to block malicious traffic:
```
(http.host eq "fun88.game" and cf.threat_score gt 14)
```

### Step 4: Performance Settings

#### Caching
- **Caching Level**: Standard
- **Browser Cache TTL**: 4 hours
- **Always Online**: On

#### Speed
- ✅ Auto Minify: CSS, JavaScript, HTML
- ✅ Brotli Compression: On
- ✅ HTTP/2: On
- ✅ HTTP/3 (with QUIC): On

### Step 5: Page Rules (Optional)

Create page rules for better performance:

```
URL: fun88.game/api/*
Settings:
- Cache Level: Bypass
- Security Level: High
```

```
URL: fun88.game/_next/static/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
```

## 🔍 DNS Record Verification

After configuration, verify your DNS records:

```bash
# Check A record
dig fun88.game A

# Check www subdomain
dig www.fun88.game A

# Check SSL certificate
openssl s_client -connect fun88.game:443 -servername fun88.game
```

## 🚀 Deployment Commands

After DNS configuration, deploy your application:

```bash
# 1. Make SSL setup script executable
chmod +x setup-ssl-fun88-game.sh

# 2. Run SSL setup
sudo ./setup-ssl-fun88-game.sh

# 3. Start PM2 processes
pm2 start ecosystem.config.js

# 4. Check PM2 status
pm2 status

# 5. Check logs
pm2 logs fun88-backend
pm2 logs fun88-frontend
```

## 🔧 Environment Variables

Set these environment variables for production:

```bash
export NODE_ENV=production
export PUBLIC_DOMAIN=https://fun88.game
export NEXT_PUBLIC_API_URL=https://fun88.game
export NEXT_PUBLIC_FRONTEND_URL=https://fun88.game
export CORS_ORIGIN=https://fun88.game
```

## 📊 Monitoring & Analytics

### Cloudflare Analytics
- Monitor traffic in **Analytics** → **Web Analytics**
- Check security events in **Security** → **Events**
- Review performance in **Speed** → **Insights**

### Server Monitoring
```bash
# Check nginx status
sudo systemctl status nginx

# Check PM2 processes
pm2 monit

# Check SSL certificate expiry
sudo certbot certificates
```

## 🛠️ Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   - Ensure Cloudflare SSL mode is set to "Full (Strict)"
   - Verify Let's Encrypt certificates are valid
   - Check nginx configuration syntax

2. **DNS Propagation**
   - Wait 5-15 minutes for DNS changes to propagate
   - Use `dig` command to verify DNS records
   - Clear browser cache and DNS cache

3. **502 Bad Gateway**
   - Check if PM2 processes are running
   - Verify nginx proxy configuration
   - Check server logs: `pm2 logs`

4. **CORS Issues**
   - Verify CORS_ORIGIN environment variable
   - Check nginx CORS headers configuration
   - Ensure API endpoints are properly configured

### Health Checks

```bash
# Test domain resolution
nslookup fun88.game

# Test HTTPS connection
curl -I https://fun88.game

# Test API endpoint
curl -I https://fun88.game/api/health

# Check SSL certificate
echo | openssl s_client -servername fun88.game -connect fun88.game:443 2>/dev/null | openssl x509 -noout -dates
```

## 📞 Support

If you encounter issues:

1. Check Cloudflare status page
2. Review server logs
3. Verify DNS propagation
4. Test SSL certificate validity
5. Check PM2 process status

---

**Note**: Replace `15.235.215.3` with your actual server IP address in all configurations.
