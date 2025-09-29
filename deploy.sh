#!/bin/bash

# 99Group Gaming Platform Deployment Script
# Deploy to https://99group.games/

set -e

echo "🚀 Starting deployment to https://99group.games/"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install PM2 first:"
    echo "npm install -g pm2"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed. Please install Nginx first."
    exit 1
fi

# Set production environment variables
export NODE_ENV=production
export PUBLIC_DOMAIN=https://99group.games
export BACKEND_URL=https://99group.games
export FRONTEND_URL=https://99group.games

print_status "Setting up production environment..."

# Create logs directory if it doesn't exist
mkdir -p /home/ubuntu/logs

# Stop existing processes
print_status "Stopping existing processes..."
pm2 stop ecosystem.production.js 2>/dev/null || true
pm2 delete ecosystem.production.js 2>/dev/null || true

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

# Build the Next.js application
print_status "Building Next.js application..."
npm run build

# Verify build was successful
if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not found"
    exit 1
fi

print_success "Build completed successfully"

# Start the applications with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.production.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup | grep -E '^sudo' | bash

print_success "Applications started with PM2"

# Check if nginx configuration exists
if [ ! -f "nginx-production.conf" ]; then
    print_error "nginx-production.conf not found"
    exit 1
fi

# Test nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_success "Nginx configuration is valid"
    
    # Copy nginx configuration
    print_status "Updating Nginx configuration..."
    sudo cp nginx-production.conf /etc/nginx/sites-available/99group.games
    sudo ln -sf /etc/nginx/sites-available/99group.games /etc/nginx/sites-enabled/
    
    # Remove default nginx site if it exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Reload nginx
    print_status "Reloading Nginx..."
    sudo systemctl reload nginx
    
    print_success "Nginx configuration updated and reloaded"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Check SSL certificate
print_status "Checking SSL certificate..."
if [ -f "/etc/letsencrypt/live/99group.games/fullchain.pem" ]; then
    print_success "SSL certificate found"
else
    print_warning "SSL certificate not found. Please run:"
    echo "sudo certbot --nginx -d 99group.games -d www.99group.games"
fi

# Health check
print_status "Performing health check..."
sleep 5

# Check if services are running
if pm2 list | grep -q "99group-backend.*online" && pm2 list | grep -q "99group-frontend.*online"; then
    print_success "All services are running"
else
    print_error "Some services are not running. Check PM2 status:"
    pm2 status
    exit 1
fi

# Test the website
print_status "Testing website accessibility..."
if curl -s -o /dev/null -w "%{http_code}" https://99group.games/ | grep -q "200"; then
    print_success "Website is accessible at https://99group.games/"
else
    print_warning "Website might not be accessible yet. Please check:"
    echo "1. DNS settings point to this server"
    echo "2. Firewall allows ports 80 and 443"
    echo "3. SSL certificate is properly configured"
fi

# Display final status
print_success "Deployment completed!"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🌐 Website: https://99group.games/"
echo "📝 Logs: /home/ubuntu/logs/"
echo ""
echo "🔧 Useful commands:"
echo "  pm2 status                    - Check service status"
echo "  pm2 logs                      - View logs"
echo "  pm2 restart all              - Restart all services"
echo "  sudo nginx -t                - Test nginx config"
echo "  sudo systemctl reload nginx  - Reload nginx"
echo ""
print_success "Deployment to https://99group.games/ is complete!"
