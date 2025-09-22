module.exports = {
  apps: [{
    name: 'api-99group-backend',
    script: 'server_enhanced.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002,
      PUBLIC_DOMAIN: 'https://api.99group.games'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
}
