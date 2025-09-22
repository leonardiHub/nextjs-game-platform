#!/bin/bash

# 99Group Games Management Script

case "$1" in
    start)
        echo "Starting 99Group Games services..."
        pm2 start ecosystem.config.js --env production
        ;;
    stop)
        echo "Stopping 99Group Games services..."
        pm2 stop all
        ;;
    restart)
        echo "Restarting 99Group Games services..."
        pm2 restart all
        ;;
    status)
        echo "99Group Games services status:"
        pm2 status
        ;;
    logs)
        echo "Showing logs for 99Group Games services..."
        pm2 logs
        ;;
    logs-nextjs)
        echo "Showing logs for Next.js service..."
        pm2 logs 99group-games-nextjs
        ;;
    logs-backend)
        echo "Showing logs for Backend service..."
        pm2 logs 99group-backend
        ;;
    monitor)
        echo "Opening PM2 monitor..."
        pm2 monit
        ;;
    build)
        echo "Building Next.js application..."
        npm run build
        ;;
    deploy)
        echo "Full deployment: build and restart..."
        npm run build
        pm2 restart all
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|logs-nextjs|logs-backend|monitor|build|deploy}"
        echo ""
        echo "Commands:"
        echo "  start       - Start all services"
        echo "  stop        - Stop all services" 
        echo "  restart     - Restart all services"
        echo "  status      - Show service status"
        echo "  logs        - Show all logs"
        echo "  logs-nextjs - Show Next.js logs only"
        echo "  logs-backend- Show backend logs only"
        echo "  monitor     - Open PM2 monitor"
        echo "  build       - Build Next.js app"
        echo "  deploy      - Build and restart (full deploy)"
        exit 1
        ;;
esac

exit 0

