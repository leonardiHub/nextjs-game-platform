#!/bin/bash

echo "🚀 99Group Complete Deployment Commands"
echo "======================================"

echo ""
echo "📋 STEP 1: Upload Nginx Configurations"
echo "scp nginx_ssl_config.conf user@99group.games:/etc/nginx/sites-available/99group.games"
echo "scp nginx_api_config.conf user@99group.games:/etc/nginx/sites-available/api.99group.games"

echo ""
echo "📋 STEP 2: Upload Backend"
echo "scp -r deployment/* user@99group.games:/var/www/backend/"

echo ""
echo "📋 STEP 3: Upload Frontend"  
echo "scp -r frontend-deployment/* user@99group.games:/var/www/99group.games/"

echo ""
echo "📋 STEP 4: SSH and Configure"
echo "ssh user@99group.games"
echo ""
echo "# Enable nginx sites"
echo "sudo ln -s /etc/nginx/sites-available/99group.games /etc/nginx/sites-enabled/"
echo "sudo ln -s /etc/nginx/sites-available/api.99group.games /etc/nginx/sites-enabled/"
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"
echo ""
echo "# Deploy backend"
echo "cd /var/www/backend"
echo "npm install"
echo "pm2 start ecosystem.config.js --env production"
echo ""
echo "# Deploy frontend"
echo "cd /var/www/99group.games"
echo "npm install"
echo "npm run build"
echo "pm2 start ecosystem.frontend.config.js --env production"

echo ""
echo "📋 STEP 5: Test Deployment"
echo "curl -I https://api.99group.games/  # Should return 200 OK (not 526)"
echo "curl https://99group.games/api/games  # Test API"
echo "curl https://99group.games/  # Test frontend"

echo ""
echo "✅ After these steps:"
echo "  - SSL Error 526 will be fixed"
echo "  - Your enhanced Next.js app will be live"
echo "  - All API endpoints will work"
echo "  - Game callbacks will be functional"

echo ""
echo "🎮 Your enhanced game platform will be live at https://99group.games!"


