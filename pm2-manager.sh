#!/bin/bash

# PM2 Management Script for Fun88 Gaming Platform
# Usage: ./pm2-manager.sh [start|stop|restart|status|logs|monitor]

case "$1" in
    start)
        echo "🚀 Starting Fun88 Gaming Platform..."
        pm2 start ecosystem.config.js
        echo "✅ Services started successfully!"
        echo "Frontend: http://localhost:5000"
        echo "Backend: http://localhost:5001"
        ;;
    stop)
        echo "🛑 Stopping Fun88 Gaming Platform..."
        pm2 stop fun88-frontend fun88-backend
        echo "✅ Services stopped successfully!"
        ;;
    restart)
        echo "🔄 Restarting Fun88 Gaming Platform..."
        pm2 restart fun88-frontend fun88-backend
        echo "✅ Services restarted successfully!"
        ;;
    status)
        echo "📊 Fun88 Gaming Platform Status:"
        pm2 list
        ;;
    logs)
        echo "📋 Showing logs (Press Ctrl+C to exit):"
        pm2 logs fun88-frontend fun88-backend
        ;;
    monitor)
        echo "📈 Opening PM2 Monitor (Press Ctrl+C to exit):"
        pm2 monit
        ;;
    delete)
        echo "🗑️ Deleting all PM2 processes..."
        pm2 delete all
        echo "✅ All processes deleted!"
        ;;
    *)
        echo "Fun88 Gaming Platform PM2 Manager"
        echo "Usage: $0 {start|stop|restart|status|logs|monitor|delete}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the gaming platform"
        echo "  stop     - Stop the gaming platform"
        echo "  restart  - Restart the gaming platform"
        echo "  status   - Show current status"
        echo "  logs     - Show real-time logs"
        echo "  monitor  - Open PM2 monitoring dashboard"
        echo "  delete   - Delete all PM2 processes"
        echo ""
        echo "Services:"
        echo "  Frontend: http://localhost:5000"
        echo "  Backend:  http://localhost:5001"
        echo "  Admin:    http://localhost:5000/admin"
        exit 1
        ;;
esac
