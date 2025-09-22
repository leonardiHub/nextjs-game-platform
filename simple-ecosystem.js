module.exports = {
  apps: [
    {
      name: 'nextjs-app',
      script: './node_modules/.bin/next',
      args: 'start --port 3000',
      cwd: '/home/ubuntu/game-platform01/nextjs-game-platform',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        PUBLIC_DOMAIN: 'https://99group.games',
      }
    },
    {
      name: 'express-api',
      script: 'server_enhanced.js',
      cwd: '/home/ubuntu/game-platform01/nextjs-game-platform',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        PUBLIC_DOMAIN: 'https://99group.games',
      }
    }
  ]
}
