module.exports = {
  apps: [
    {
      name: '99group-game-platform',
      script: 'server_enhanced.js',
      cwd: '/home/ubuntu/game-platform01/nextjs-game-platform',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        PUBLIC_DOMAIN: 'https://99group.games'
      },
      error_file: '/home/ubuntu/logs/99group-platform-error.log',
      out_file: '/home/ubuntu/logs/99group-platform-out.log',
      log_file: '/home/ubuntu/logs/99group-platform-combined.log',
      time: true,
      merge_logs: true,
    }
  ]
}
