# 🚀 FUN88.GAME Quick Start Guide

This guide will help you deploy your fun88-v1 project to the new `fun88.game` domain with Cloudflare configuration.

## 📋 Prerequisites

- Domain `fun88.game` registered and added to Cloudflare
- Server with public IP (e.g., `15.235.215.3`)
- Ubuntu/Linux server with root access
- Node.js and npm installed
- PM2 process manager installed

## 🚀 Quick Deployment

### Step 1: Configure Cloudflare DNS

1. **Login to Cloudflare Dashboard**
2. **Select your `fun88.game` domain**
3. **Add DNS Records:**

```
Type: A
Name: @
Content: YOUR_SERVER_IP
Proxy: ✅ Proxied (Orange Cloud)

Type: A  
Name: www
Content: YOUR_SERVER_IP
Proxy: ✅ Proxied (Orange Cloud)
```

4. **Set SSL/TLS Mode:**
   - Go to **SSL/TLS** → **Overview**
   - Set to **Full (Strict)**
   - Enable **Always Use HTTPS**

### Step 2: Deploy to Server

```bash
# 1. Navigate to project directory
cd /home/ubuntu/fun88-v1

# 2. Run deployment script
./deploy-fun88-game.sh

# 3. Setup SSL certificates
sudo ./setup-ssl-fun88-game.sh

# 4. Check deployment status
pm2 status
```

### Step 3: Verify Deployment

```bash
# Check if services are running
pm2 status

# Test local endpoints
curl http://localhost:5000
curl http://localhost:3006/api/health

# Test domain (after DNS propagation)
curl -I https://fun88.game
```

## 🔧 Configuration Files Updated

The following files have been updated for `fun88.game`:

- ✅ `src/utils/config.ts` - API configuration
- ✅ `ecosystem.config.js` - PM2 configuration  
- ✅ `next.config.js` - Next.js configuration
- ✅ `nginx-fun88-game.conf` - Nginx configuration
- ✅ `setup-ssl-fun88-game.sh` - SSL setup script
- ✅ `deploy-fun88-game.sh` - Deployment script

## 🌐 Domain Configuration

### Current Setup:
- **Domain**: `fun88.game`
- **Frontend**: Port 5000 (Next.js)
- **Backend**: Port 3006 (Express)
- **SSL**: Let's Encrypt certificates
- **Proxy**: Nginx reverse proxy

### Environment Variables:
```bash
NODE_ENV=production
PUBLIC_DOMAIN=https://fun88.game
NEXT_PUBLIC_API_URL=https://fun88.game
NEXT_PUBLIC_FRONTEND_URL=https://fun88.game
CORS_ORIGIN=https://fun88.game
```

## 📊 Monitoring Commands

```bash
# Check PM2 processes
pm2 status
pm2 monit

# View logs
pm2 logs fun88-backend
pm2 logs fun88-frontend

# Check nginx
sudo systemctl status nginx
sudo nginx -t

# Check SSL certificates
sudo certbot certificates
```

## 🔍 Troubleshooting

### Common Issues:

1. **502 Bad Gateway**
   ```bash
   # Check if PM2 processes are running
   pm2 status
   
   # Restart if needed
   pm2 restart all
   ```

2. **SSL Certificate Issues**
   ```bash
   # Renew certificates
   sudo certbot renew
   
   # Check certificate status
   sudo certbot certificates
   ```

3. **DNS Not Resolving**
   - Wait 5-15 minutes for DNS propagation
   - Check Cloudflare DNS settings
   - Verify domain is proxied (orange cloud)

4. **CORS Errors**
   - Check environment variables
   - Verify nginx CORS headers
   - Ensure API endpoints are configured

## 📞 Support

If you encounter issues:

1. **Check logs**: `pm2 logs`
2. **Verify DNS**: `nslookup fun88.game`
3. **Test SSL**: `openssl s_client -connect fun88.game:443`
4. **Check nginx**: `sudo nginx -t`

## 🎯 Next Steps

After successful deployment:

1. **Configure Cloudflare Security Settings**
2. **Set up monitoring and alerts**
3. **Configure backup procedures**
4. **Test all functionality**
5. **Set up SSL certificate auto-renewal**

---

**Note**: Replace `YOUR_SERVER_IP` with your actual server IP address in all configurations.
