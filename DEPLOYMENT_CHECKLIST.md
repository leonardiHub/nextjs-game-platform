# 99Group Gaming Platform Deployment Checklist
## Deploying to https://99group.games/

### Pre-Deployment Requirements

#### 1. Server Setup
- [ ] Ubuntu server with root/sudo access
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] Nginx installed and configured
- [ ] SSL certificate for 99group.games (Let's Encrypt)

#### 2. DNS Configuration
- [ ] A record: `99group.games` → Server IP
- [ ] A record: `www.99group.games` → Server IP
- [ ] CNAME record: `api.99group.games` → `99group.games` (optional)

#### 3. Firewall Configuration
- [ ] Port 80 (HTTP) open
- [ ] Port 443 (HTTPS) open
- [ ] Port 22 (SSH) open
- [ ] Port 3000 (Next.js) - internal only
- [ ] Port 3002 (Backend) - internal only

#### 4. SSL Certificate
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d 99group.games -d www.99group.games
```

### Deployment Steps

#### 1. Run Deployment Script
```bash
cd /home/ubuntu/nextjs-game-platform
./deploy.sh
```

#### 2. Manual Verification
```bash
# Check PM2 processes
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Test website
curl -I https://99group.games/

# Check logs
pm2 logs
tail -f /home/ubuntu/logs/99group-frontend-combined.log
```

#### 3. Post-Deployment Configuration

##### Environment Variables
Set these in your production environment:
```bash
export NODE_ENV=production
export PUBLIC_DOMAIN=https://99group.games
export BACKEND_URL=https://99group.games
export FRONTEND_URL=https://99group.games
```

##### Database Setup (if needed)
```bash
# If using external database, update connection strings
# Update your backend configuration accordingly
```

### Monitoring & Maintenance

#### 1. Health Checks
- [ ] Website loads: https://99group.games/
- [ ] API responds: https://99group.games/api/health
- [ ] Admin panel: https://99group.games/admin
- [ ] Live casino: https://99group.games/live-casino
- [ ] Blog: https://99group.games/blog

#### 2. Performance Monitoring
```bash
# Check PM2 monitoring
pm2 monit

# Check system resources
htop
df -h
free -h
```

#### 3. Log Management
```bash
# View logs
pm2 logs 99group-frontend
pm2 logs 99group-backend

# Log rotation (set up cron job)
sudo crontab -e
# Add: 0 0 * * * /usr/sbin/logrotate /etc/logrotate.d/pm2
```

#### 4. Backup Strategy
```bash
# Backup application
tar -czf backup-$(date +%Y%m%d).tar.gz /home/ubuntu/nextjs-game-platform

# Backup logs
tar -czf logs-$(date +%Y%m%d).tar.gz /home/ubuntu/logs
```

### Troubleshooting

#### Common Issues

1. **Website not loading**
   - Check PM2 status: `pm2 status`
   - Check Nginx: `sudo nginx -t`
   - Check logs: `pm2 logs`

2. **SSL certificate issues**
   - Renew certificate: `sudo certbot renew`
   - Check certificate: `sudo certbot certificates`

3. **API not responding**
   - Check backend process: `pm2 logs 99group-backend`
   - Check port binding: `netstat -tlnp | grep 3002`

4. **Static files not loading**
   - Check Next.js build: `ls -la .next/`
   - Check Nginx proxy configuration

#### Emergency Commands
```bash
# Restart all services
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx

# Check system status
sudo systemctl status nginx
pm2 status
```

### Security Checklist

- [ ] SSL certificate installed and valid
- [ ] Security headers configured in Nginx
- [ ] Firewall properly configured
- [ ] Regular security updates
- [ ] Strong passwords for all accounts
- [ ] Database security (if applicable)
- [ ] API rate limiting enabled
- [ ] CORS properly configured

### Performance Optimization

- [ ] Gzip compression enabled
- [ ] Static file caching configured
- [ ] CDN setup (optional)
- [ ] Database optimization (if applicable)
- [ ] Image optimization
- [ ] Code splitting enabled

### Success Criteria

- [ ] Website loads at https://99group.games/
- [ ] All pages accessible (home, blog, live-casino, admin)
- [ ] API endpoints responding correctly
- [ ] SSL certificate valid and secure
- [ ] Performance metrics within acceptable range
- [ ] Error logs clean
- [ ] All features working as expected

---

**Deployment Date:** ___________
**Deployed By:** ___________
**Version:** ___________
**Notes:** ___________
