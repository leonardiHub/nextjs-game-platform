#!/bin/bash

# 99Group游戏平台 SSL配置脚本
# 适用于 Cloudflare Full (Strict) SSL

echo "🔒 开始配置SSL证书..."

# 安装Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 配置域名（请替换为您的实际域名）
DOMAIN="99group.games"
EMAIL="admin@99group.games"

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
cat > /tmp/nginx_ssl.conf << 'EOF'
server {
    listen 80;
    server_name 99group.games www.99group.games;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 99group.games www.99group.games;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/99group.games/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/99group.games/privkey.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 反向代理到游戏平台
    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 游戏平台优化
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3006;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API路径优化
    location /api/ {
        proxy_pass http://localhost:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # API专用超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
EOF

# 备份原配置并应用新配置
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
sudo cp /tmp/nginx_ssl.conf /etc/nginx/sites-available/default

# 测试Nginx配置
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx配置测试通过"
    sudo systemctl start nginx
    sudo systemctl reload nginx
    echo "🚀 SSL配置完成！"
else
    echo "❌ Nginx配置有误，请检查"
    sudo cp /etc/nginx/sites-available/default.backup /etc/nginx/sites-available/default
    sudo systemctl start nginx
fi

# 设置证书自动续期
echo "⏰ 设置证书自动续期..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -

echo "🎉 SSL配置完成！请在Cloudflare中设置为 Full (Strict) SSL"
echo "📋 检查清单："
echo "   ✓ Let's Encrypt证书已安装"
echo "   ✓ Nginx SSL配置已应用"
echo "   ✓ 自动续期已设置"
echo "   ⏳ 请在Cloudflare设置Full (Strict) SSL"
