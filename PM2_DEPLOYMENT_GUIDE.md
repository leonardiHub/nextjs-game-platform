# 🚀 PM2 Deployment Guide - Fun88 Gaming Platform

This guide explains how to deploy and manage the Fun88 Gaming Platform using PM2 on ports 5000-5999.

## 📋 Prerequisites

- Node.js 18+ installed
- PM2 installed globally (`npm install -g pm2`)
- Project dependencies installed (`npm install`)

## 🎯 Current Configuration

- **Frontend (Next.js):** Port 5000
- **Backend (Express):** Port 5001
- **Database:** SQLite (local file)
- **Process Manager:** PM2

## 🚀 Quick Start

### 1. Build the Project
```bash
npm run build
```

### 2. Start with PM2
```bash
# Using the management script
./pm2-manager.sh start

# Or directly with PM2
pm2 start ecosystem.config.js
```

### 3. Verify Services
```bash
# Check status
./pm2-manager.sh status

# Test frontend
curl http://localhost:5000

# Test backend
curl http://localhost:5001/api/games
```

## 🛠️ Management Commands

### Using the Management Script
```bash
# Start services
./pm2-manager.sh start

# Stop services
./pm2-manager.sh stop

# Restart services
./pm2-manager.sh restart

# Check status
./pm2-manager.sh status

# View logs
./pm2-manager.sh logs

# Open monitor
./pm2-manager.sh monitor

# Delete all processes
./pm2-manager.sh delete
```

### Direct PM2 Commands
```bash
# Start specific service
pm2 start fun88-backend
pm2 start fun88-frontend

# Stop specific service
pm2 stop fun88-backend
pm2 stop fun88-frontend

# Restart specific service
pm2 restart fun88-backend
pm2 restart fun88-frontend

# View logs
pm2 logs fun88-backend
pm2 logs fun88-frontend

# Monitor all processes
pm2 monit

# Save PM2 configuration
pm2 save

# Restore PM2 configuration
pm2 resurrect
```

## 🔧 Configuration Files

### ecosystem.config.js
The main PM2 configuration file with:
- Backend service (port 5001)
- Frontend service (port 5000)
- Environment variables
- Logging configuration
- Restart policies

### Port Configuration
- **Frontend:** 5000 (Next.js)
- **Backend:** 5001 (Express)
- **Database:** SQLite (no port needed)

## 📊 Monitoring

### Real-time Monitoring
```bash
# Open PM2 monitor
pm2 monit

# Or use the management script
./pm2-manager.sh monitor
```

### Log Management
```bash
# View all logs
pm2 logs

# View specific service logs
pm2 logs fun88-backend
pm2 logs fun88-frontend

# View logs with timestamps
pm2 logs --timestamp

# Clear logs
pm2 flush
```

### Process Information
```bash
# List all processes
pm2 list

# Show detailed info
pm2 show fun88-backend
pm2 show fun88-frontend

# Show process tree
pm2 prettylist
```

## 🔄 Auto-restart Configuration

The PM2 configuration includes:
- **Auto-restart:** Enabled
- **Max restarts:** 10
- **Min uptime:** 10 seconds
- **Restart delay:** 4 seconds
- **Memory limit:** 1GB

## 📁 Log Files

Logs are stored in the `./logs/` directory:
- `backend-combined.log` - Backend all logs
- `backend-out.log` - Backend stdout
- `backend-error.log` - Backend stderr
- `frontend-combined.log` - Frontend all logs
- `frontend-out.log` - Frontend stdout
- `frontend-error.log` - Frontend stderr

## 🌐 Access URLs

- **Frontend:** http://localhost:5000
- **Backend API:** http://localhost:5001
- **Admin Panel:** http://localhost:5000/admin
- **Games API:** http://localhost:5001/api/games

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :5000
   lsof -i :5001
   
   # Kill process
   kill -9 <PID>
   ```

2. **Service Won't Start**
   ```bash
   # Check logs
   pm2 logs fun88-backend
   
   # Restart with verbose logging
   pm2 restart fun88-backend --update-env
   ```

3. **Database Issues**
   ```bash
   # Check if database file exists
   ls -la fun88_standalone.db
   
   # Check database permissions
   chmod 644 fun88_standalone.db
   ```

4. **Memory Issues**
   ```bash
   # Check memory usage
   pm2 monit
   
   # Restart if needed
   pm2 restart all
   ```

### Debug Mode

Run services in debug mode:
```bash
# Backend debug
NODE_ENV=development PORT=5001 node server_enhanced.js

# Frontend debug
NODE_ENV=development PORT=5000 npm start
```

## 🔒 Security Considerations

1. **Environment Variables**
   - Change JWT secret in production
   - Use strong passwords
   - Set proper CORS origins

2. **Database Security**
   - Regular backups
   - Proper file permissions
   - Consider encryption for sensitive data

3. **Network Security**
   - Use reverse proxy (nginx)
   - Enable HTTPS
   - Firewall configuration

## 📈 Performance Optimization

1. **PM2 Cluster Mode** (for backend)
   ```javascript
   // In ecosystem.config.js
   instances: 'max', // Use all CPU cores
   exec_mode: 'cluster'
   ```

2. **Memory Management**
   ```javascript
   // Auto-restart on memory limit
   max_memory_restart: '1G'
   ```

3. **Log Rotation**
   ```bash
   # Install PM2 log rotate
   pm2 install pm2-logrotate
   ```

## 🚀 Production Deployment

1. **Environment Setup**
   ```bash
   export NODE_ENV=production
   export PORT=5001
   export NEXT_PUBLIC_API_URL=http://your-domain.com:5001
   ```

2. **Start Services**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

3. **Save Configuration**
   ```bash
   pm2 save
   pm2 startup
   ```

4. **Set up Reverse Proxy** (nginx example)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
       }
       
       location /api {
           proxy_pass http://localhost:5001;
       }
   }
   ```

## 📞 Support

For issues or questions:
1. Check PM2 logs: `pm2 logs`
2. Check service status: `pm2 list`
3. Restart services: `pm2 restart all`
4. Check system resources: `pm2 monit`

## 🎉 Success!

Your Fun88 Gaming Platform is now running on PM2 with:
- ✅ Frontend on port 5000
- ✅ Backend on port 5001
- ✅ Auto-restart enabled
- ✅ Logging configured
- ✅ Monitoring available

Access your platform at: http://localhost:5000
