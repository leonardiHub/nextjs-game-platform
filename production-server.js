const express = require('express')
const path = require('path')
const cors = require('cors')

// Import the existing API server
const apiServer = require('./server_enhanced.js')

const app = express()
const PORT = process.env.PORT || 3002

// CORS configuration
app.use(
  cors({
    origin: ['https://99group.games', 'http://localhost:3000'],
    credentials: true,
  })
)

// Serve Next.js static files
app.use('/_next', express.static(path.join(__dirname, '.next')))
app.use('/static', express.static(path.join(__dirname, '.next/static')))
app.use(express.static(path.join(__dirname, 'public')))

// API routes - proxy to the existing server
app.use('/api', apiServer)

// Serve Next.js pages for all other routes
app.get('*', (req, res) => {
  // Try to serve from Next.js App Router build first
  const indexPath = path.join(__dirname, '.next/server/app/index.html')

  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    // Fallback to public/index.html if Next.js build not available
    const fallbackPath = path.join(__dirname, 'public/index.html')
    if (require('fs').existsSync(fallbackPath)) {
      res.sendFile(fallbackPath)
    } else {
      res.status(404).send(`
        <html>
          <head><title>99Group Gaming Platform</title></head>
          <body>
            <h1>🎮 99Group Gaming Platform</h1>
            <p>Platform is starting up... Please wait a moment.</p>
            <p>If this persists, please check the server logs.</p>
          </body>
        </html>
      `)
    }
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`)
  console.log(`🌐 Visit: https://99group.games`)
  console.log(`📊 API: https://99group.games/api`)
})
