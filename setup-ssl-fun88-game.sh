#!/bin/bash

# FUN88.GAME SSL配置脚本
# 适用于 Cloudflare Full (Strict) SSL

echo "🔒 开始为 fun88.game 配置SSL证书..."

# 安装Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 配置域名
DOMAIN="fun88.game"
EMAIL="admin@fun88.game"

echo "📜 为域名 $DOMAIN 申请Let's Encrypt证书..."

# 停止Nginx以释放80端口
sudo systemctl stop nginx

# 申请证书
sudo certbot certonly --standalone \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

# 创建Nginx SSL配置
cat > /tmp/nginx_fun88_game_ssl.conf << 'EOF'
server {
    listen 80;
    server_name fun88.game www.fun88.game;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fun88.game www.fun88.game;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/fun88.game/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fun88.game/privkey.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 反向代理到游戏平台
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API路由
    location /api/ {
        proxy_pass http://localhost:3006/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 复制配置文件到nginx目录
sudo cp /tmp/nginx_fun88_game_ssl.conf /etc/nginx/sites-available/fun88.game
sudo ln -sf /etc/nginx/sites-available/fun88.game /etc/nginx/sites-enabled/

# 测试nginx配置
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx配置测试通过"
    # 启动Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    echo "🚀 SSL配置完成！"
    echo "📋 下一步："
    echo "   1. 在Cloudflare中配置DNS记录"
    echo "   2. 设置SSL模式为 'Full (Strict)'"
    echo "   3. 启动PM2进程: pm2 start ecosystem.config.js"
else
    echo "❌ Nginx配置测试失败，请检查配置文件"
    exit 1
fi
