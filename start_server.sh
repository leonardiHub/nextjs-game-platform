#!/bin/bash

# 设置正确的公共域名
export PUBLIC_DOMAIN="https://api.99group.games"

# 显示配置
echo "Starting 99Group Games Server..."
echo "PUBLIC_DOMAIN: $PUBLIC_DOMAIN"

# 启动服务器
cd /home/ubuntu/game-platform01/game-staging
nohup node server_enhanced.js > server.log 2>&1 &

echo "Server started with PID: $!"
echo "Log file: /home/ubuntu/game-platform01/game-staging/server.log"
