#!/bin/bash

# FUN88.GAME Deployment Script
# Complete deployment for fun88.game domain

echo "🚀 Starting FUN88.GAME deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="fun88.game"
SERVER_IP="15.235.215.3"
PROJECT_DIR="/home/ubuntu/fun88-v1"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "Server IP: $SERVER_IP"
echo "Project Directory: $PROJECT_DIR"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# Step 1: Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if running as root for certain operations
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Running as root. Some operations may need adjustment.${NC}"
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory $PROJECT_DIR not found${NC}"
    exit 1
fi
print_status 0 "Project directory exists"

# Check if required files exist
required_files=("ecosystem.config.js" "server_enhanced.js" "package.json" "next.config.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$PROJECT_DIR/$file" ]; then
        echo -e "${RED}❌ Required file $file not found${NC}"
        exit 1
    fi
done
print_status 0 "Required files exist"

# Step 2: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd $PROJECT_DIR

if [ -f "package.json" ]; then
    npm install --production
    print_status $? "Dependencies installed"
else
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

# Step 3: Build Next.js application
echo -e "${BLUE}🔨 Building Next.js application...${NC}"
npm run build
print_status $? "Next.js application built"

# Step 4: Configure SSL (if not already done)
echo -e "${BLUE}🔒 Configuring SSL...${NC}"
if [ -f "setup-ssl-fun88-game.sh" ]; then
    chmod +x setup-ssl-fun88-game.sh
    echo -e "${YELLOW}⚠️  SSL setup script found. Run manually if needed:${NC}"
    echo "sudo ./setup-ssl-fun88-game.sh"
else
    echo -e "${YELLOW}⚠️  SSL setup script not found. Configure SSL manually.${NC}"
fi

# Step 5: Configure Nginx
echo -e "${BLUE}🌐 Configuring Nginx...${NC}"
if [ -f "nginx-fun88-game.conf" ]; then
    sudo cp nginx-fun88-game.conf /etc/nginx/sites-available/fun88.game
    sudo ln -sf /etc/nginx/sites-available/fun88.game /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    sudo nginx -t
    if [ $? -eq 0 ]; then
        print_status 0 "Nginx configuration valid"
        sudo systemctl reload nginx
        print_status $? "Nginx reloaded"
    else
        echo -e "${RED}❌ Nginx configuration test failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx configuration file not found${NC}"
    exit 1
fi

# Step 6: Stop existing PM2 processes (if any)
echo -e "${BLUE}🛑 Stopping existing PM2 processes...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
print_status 0 "Existing processes stopped"

# Step 7: Start PM2 processes
echo -e "${BLUE}🚀 Starting PM2 processes...${NC}"
pm2 start ecosystem.config.js
print_status $? "PM2 processes started"

# Step 8: Save PM2 configuration
pm2 save
print_status $? "PM2 configuration saved"

# Step 9: Setup PM2 startup
pm2 startup
print_status $? "PM2 startup configured"

# Step 10: Verify deployment
echo -e "${BLUE}🔍 Verifying deployment...${NC}"

# Check PM2 status
pm2 status
print_status $? "PM2 processes running"

# Check if ports are listening
netstat -tlnp | grep -E ":(3006|5000)" > /dev/null
print_status $? "Application ports listening"

# Check nginx status
sudo systemctl is-active nginx > /dev/null
print_status $? "Nginx is active"

# Step 11: Display deployment summary
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "Domain: $DOMAIN"
echo "Frontend: http://localhost:5000"
echo "Backend: http://localhost:3006"
echo "Nginx: Configured for $DOMAIN"
echo ""
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo "1. Configure Cloudflare DNS (see CLOUDFLARE_DNS_SETUP.md)"
echo "2. Set up SSL certificates: sudo ./setup-ssl-fun88-game.sh"
echo "3. Test the deployment: curl -I https://$DOMAIN"
echo ""
echo -e "${BLUE}📊 Monitoring Commands:${NC}"
echo "pm2 status                    # Check PM2 processes"
echo "pm2 logs fun88-backend        # Backend logs"
echo "pm2 logs fun88-frontend       # Frontend logs"
echo "sudo systemctl status nginx   # Nginx status"
echo ""
echo -e "${BLUE}🌐 Test URLs:${NC}"
echo "https://$DOMAIN               # Main site"
echo "https://$DOMAIN/api/health    # API health check"
echo "https://$DOMAIN/admin          # Admin panel"
echo ""

# Step 12: Health check
echo -e "${BLUE}🏥 Running health checks...${NC}"

# Check if services are responding
sleep 5

# Test backend health
if command_exists curl; then
    curl -s http://localhost:3006/api/health > /dev/null
    if [ $? -eq 0 ]; then
        print_status 0 "Backend health check passed"
    else
        echo -e "${YELLOW}⚠️  Backend health check failed (may need time to start)${NC}"
    fi
    
    # Test frontend
    curl -s http://localhost:5000 > /dev/null
    if [ $? -eq 0 ]; then
        print_status 0 "Frontend health check passed"
    else
        echo -e "${YELLOW}⚠️  Frontend health check failed (may need time to start)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl not available, skipping health checks${NC}"
fi

echo ""
echo -e "${GREEN}✅ FUN88.GAME deployment completed!${NC}"
echo -e "${BLUE}📖 For detailed Cloudflare setup, see: CLOUDFLARE_DNS_SETUP.md${NC}"
