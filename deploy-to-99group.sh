#!/bin/bash

# 99Group Game Platform Deployment Script
# Deploy nextjs-game-platform to https://99group.games/

echo "🚀 Starting deployment of NextJS Game Platform to 99group.games..."

# Configuration
DOMAIN="99group.games"
BACKEND_PORT=3002
FRONTEND_PORT=3000
PROJECT_DIR="/home/ubuntu/game-platform01/nextjs-game-platform"
NGINX_CONFIG="/etc/nginx/sites-available/default"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root for nginx operations
check_permissions() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script needs sudo privileges for nginx configuration"
        echo "Please run: sudo $0"
        exit 1
    fi
}

# Stop existing services
stop_services() {
    print_status "Stopping existing services..."
    
    # Stop PM2 processes
    sudo -u ubuntu pm2 stop all 2>/dev/null || true
    sudo -u ubuntu pm2 delete all 2>/dev/null || true
    
    # Stop any running node processes
    pkill -f "node.*server_enhanced.js" 2>/dev/null || true
    pkill -f "next.*dev\|next.*start" 2>/dev/null || true
    
    print_status "Services stopped"
}

# Build Next.js frontend
build_frontend() {
    print_status "Building Next.js frontend..."
    
    cd $PROJECT_DIR
    sudo -u ubuntu npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Frontend build completed"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Update server configuration for production
update_server_config() {
    print_status "Updating server configuration..."
    
    # Update server_enhanced.js to serve static files from Next.js build
    cat > $PROJECT_DIR/production_server.js << 'EOF'
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Import the existing server
const originalServer = require('./server_enhanced.js');

const app = express();
const PORT = process.env.PORT || 3002;

// Serve Next.js static files
app.use('/_next', express.static(path.join(__dirname, '.next')));
app.use('/static', express.static(path.join(__dirname, '.next/static')));

// Serve public files
app.use(express.static(path.join(__dirname, 'public')));

// API routes (handled by existing server)
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:3068',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    }
}));

// Serve Next.js pages
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '.next/server/pages/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Production server running on port ${PORT}`);
    console.log(`🌐 Visit: https://99group.games`);
});
EOF

    print_status "Server configuration updated"
}

# Setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Install certbot if not already installed
    apt update
    apt install certbot python3-certbot-nginx -y
    
    # Stop nginx to free port 80
    systemctl stop nginx 2>/dev/null || true
    
    # Get SSL certificate
    certbot certonly --standalone \
        --email admin@99group.games \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    if [ $? -eq 0 ]; then
        print_status "SSL certificates obtained"
    else
        print_error "SSL certificate generation failed"
        exit 1
    fi
}

# Configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Backup existing configuration
    cp $NGINX_CONFIG ${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)
    
    # Create new Nginx configuration
    cat > $NGINX_CONFIG << 'EOF'
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name 99group.games www.99group.games;
    return 301 https://$server_name$request_uri;
}

# HTTPS main configuration
server {
    listen 443 ssl http2;
    server_name 99group.games www.99group.games;

    # SSL certificate configuration
    ssl_certificate /etc/letsencrypt/live/99group.games/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/99group.games/privkey.pem;
    
    # SSL security configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Client max upload size
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Main proxy to game platform
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Game platform optimization
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
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
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        proxy_pass http://localhost:3002;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # KYC file upload
    location /uploads/ {
        proxy_pass http://localhost:3002/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Upload specific configuration
        proxy_request_buffering off;
        client_max_body_size 10M;
    }
    
    # Admin panel
    location /admin {
        proxy_pass http://localhost:3002/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Additional security headers for admin
        add_header X-Frame-Options DENY;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
EOF

    # Test nginx configuration
    nginx -t
    
    if [ $? -eq 0 ]; then
        print_status "Nginx configuration is valid"
    else
        print_error "Nginx configuration is invalid"
        # Restore backup
        cp ${NGINX_CONFIG}.backup.$(date +%Y%m%d)* $NGINX_CONFIG 2>/dev/null || true
        exit 1
    fi
}

# Start services with PM2
start_services() {
    print_status "Starting services with PM2..."
    
    cd $PROJECT_DIR
    
    # Update ecosystem config for production
    cat > ecosystem.production.js << EOF
module.exports = {
  apps: [
    {
      name: '99group-game-platform',
      script: 'server_enhanced.js',
      cwd: '$PROJECT_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        PUBLIC_DOMAIN: 'https://99group.games'
      },
      error_file: '/home/ubuntu/logs/99group-platform-error.log',
      out_file: '/home/ubuntu/logs/99group-platform-out.log',
      log_file: '/home/ubuntu/logs/99group-platform-combined.log',
      time: true,
      merge_logs: true,
    }
  ]
}
EOF
    
    # Create logs directory
    mkdir -p /home/ubuntu/logs
    chown ubuntu:ubuntu /home/ubuntu/logs
    
    # Start with PM2
    sudo -u ubuntu pm2 start ecosystem.production.js
    sudo -u ubuntu pm2 save
    sudo -u ubuntu pm2 startup
    
    print_status "Services started with PM2"
}

# Start nginx
start_nginx() {
    print_status "Starting Nginx..."
    
    systemctl enable nginx
    systemctl start nginx
    systemctl reload nginx
    
    if systemctl is-active --quiet nginx; then
        print_status "Nginx is running"
    else
        print_error "Failed to start Nginx"
        exit 1
    fi
}

# Setup auto-renewal for SSL certificates
setup_ssl_renewal() {
    print_status "Setting up SSL certificate auto-renewal..."
    
    # Add cron job for certificate renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -
    
    print_status "SSL auto-renewal configured"
}

# Main deployment function
main() {
    echo "🎮 99Group Game Platform Deployment"
    echo "=================================="
    echo ""
    
    # Check permissions
    check_permissions
    
    # Stop existing services
    stop_services
    
    # Build frontend
    build_frontend
    
    # Setup SSL certificates
    setup_ssl
    
    # Configure Nginx
    configure_nginx
    
    # Start services
    start_services
    
    # Start Nginx
    start_nginx
    
    # Setup SSL renewal
    setup_ssl_renewal
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "=================================="
    echo ""
    echo "📋 Deployment Summary:"
    echo "   ✅ Next.js frontend built and deployed"
    echo "   ✅ Backend server running on port $BACKEND_PORT"
    echo "   ✅ SSL certificates installed"
    echo "   ✅ Nginx configured and running"
    echo "   ✅ PM2 process management enabled"
    echo "   ✅ Auto SSL renewal configured"
    echo ""
    echo "🌐 Access your platform:"
    echo "   🎮 Main site: https://99group.games"
    echo "   🔧 Admin panel: https://99group.games/admin"
    echo ""
    echo "📊 Monitor services:"
    echo "   📋 PM2 status: pm2 status"
    echo "   📋 PM2 logs: pm2 logs"
    echo "   📋 Nginx status: systemctl status nginx"
    echo ""
    echo "⚠️  Important notes:"
    echo "   1. Make sure Cloudflare SSL is set to 'Full (Strict)'"
    echo "   2. Ensure DNS A records point to this server"
    echo "   3. Check firewall allows ports 80, 443"
    echo ""
}

# Run main function
main "$@"
