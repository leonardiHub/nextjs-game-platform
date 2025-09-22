#!/bin/bash

# 游戏平台启动脚本 - 支持自定义域名
# 使用方法: ./start_with_domain.sh yourdomain.com
# 或者: PUBLIC_DOMAIN=https://yourdomain.com node server_enhanced.js

if [ $# -eq 1 ]; then
    # 如果提供了域名参数
    DOMAIN=$1
    
    # 检查是否包含协议，如果没有则添加https://
    if [[ $DOMAIN != http* ]]; then
        DOMAIN="https://$DOMAIN"
    fi
    
    echo "🚀 启动游戏平台，使用域名: $DOMAIN"
    export PUBLIC_DOMAIN=$DOMAIN
else
    echo "🏠 启动游戏平台，使用本地地址: http://localhost:3002"
fi

echo "📋 当前配置:"
echo "   - 服务端口: 3002"
echo "   - 公网域名: ${PUBLIC_DOMAIN:-http://localhost:3002}"
echo "   - 回调地址: ${PUBLIC_DOMAIN:-http://localhost:3002}/api/game/callback"
echo ""

# 启动服务器
node server_enhanced.js
