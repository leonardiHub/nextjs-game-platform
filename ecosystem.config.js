module.exports = {
  apps: [
    {
      name: '99group-game-platform',
      script: 'server_enhanced.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        PUBLIC_DOMAIN: 'https://99group.games',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
}
