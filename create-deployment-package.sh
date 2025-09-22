#!/bin/bash

echo "🚀 Creating Next.js Deployment Package for 99group.games"
echo "========================================================"

# Create deployment directory
rm -rf frontend-deployment
mkdir -p frontend-deployment

# Copy built application
echo "📦 Copying build files..."
cp -r .next frontend-deployment/
cp -r public frontend-deployment/
cp -r src frontend-deployment/
cp package.json frontend-deployment/
cp package-lock.json frontend-deployment/
cp next.config.* frontend-deployment/ 2>/dev/null || true
cp tsconfig.json frontend-deployment/
cp postcss.config.mjs frontend-deployment/
cp .prettierrc frontend-deployment/

# Copy environment and config files
cp -r .vscode frontend-deployment/ 2>/dev/null || true

# Create production environment file
cat > frontend-deployment/.env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://99group.games
NEXT_PUBLIC_FRONTEND_URL=https://99group.games
EOF

# Create PM2 ecosystem for frontend
cat > frontend-deployment/ecosystem.frontend.config.js << EOF
module.exports = {
  apps: [{
    name: '99group-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/99group.games',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'https://99group.games'
    },
    log_file: './logs/frontend-combined.log',
    out_file: './logs/frontend-out.log',
    error_file: './logs/frontend-error.log',
    max_memory_restart: '512M'
  }]
}
EOF

# Create deployment script
cat > frontend-deployment/deploy.sh << EOF
#!/bin/bash
echo "🚀 Deploying 99Group Frontend..."

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.frontend.config.js --env production

echo "✅ Frontend deployed successfully!"
echo "🌐 Available at: https://99group.games"
EOF

chmod +x frontend-deployment/deploy.sh

# Create deployment README
cat > frontend-deployment/DEPLOYMENT_INSTRUCTIONS.md << EOF
# 🚀 99Group Frontend Deployment

## 📦 Package Contents:
- .next/ - Built Next.js application
- src/ - Source code
- public/ - Static assets  
- package.json - Dependencies
- ecosystem.frontend.config.js - PM2 configuration
- .env.production - Production environment
- deploy.sh - Automated deployment script

## 🛠️ Deployment Steps:

### 1. Upload to Server
\`\`\`bash
scp -r frontend-deployment/* user@99group.games:/var/www/99group.games/
\`\`\`

### 2. SSH and Deploy
\`\`\`bash
ssh user@99group.games
cd /var/www/99group.games
chmod +x deploy.sh
./deploy.sh
\`\`\`

### 3. Monitor
\`\`\`bash
pm2 logs 99group-frontend
pm2 status
\`\`\`

## ✅ Features Included:
- ✅ Enhanced Dark Navbar with Lucide icons
- ✅ Sticky navigation
- ✅ HUIDU API integration
- ✅ AES encryption support
- ✅ Complete game platform functionality
- ✅ Responsive design
- ✅ Production-ready build

## 🌐 Result:
Your enhanced Next.js application will be live at https://99group.games
EOF

echo ""
echo "✅ Deployment package created successfully!"
echo "📁 Location: ./frontend-deployment/"
echo ""
echo "📋 Package includes:"
echo "  - Built Next.js application (.next/)"
echo "  - Source code and assets"
echo "  - PM2 configuration"
echo "  - Production environment"
echo "  - Automated deployment script"
echo ""
echo "🚀 Ready to upload to 99group.games server!"


