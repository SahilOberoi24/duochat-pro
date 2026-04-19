import http from 'http'
import { config } from 'dotenv'

config({ path: '.env.local' })

const apiKey = process.env.VITE_ANTHROPIC_API_KEY

console.log('API Key available:', !!apiKey)

const server = http.createServer(async (req, res) => {
  // Set CORS headers to allow requests from Vite dev server
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', async () => {
      try {
        const { systemPrompt, messages } = JSON.parse(body)

        if (!apiKey) {
          res.writeHead(500)
          res.end(JSON.stringify({ error: 'Missing VITE_ANTHROPIC_API_KEY environment variable' }))
          return
        }

        console.log('Calling Anthropic API...')
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: systemPrompt,
            messages
          })
        })

        const data = await response.json()
        console.log('Anthropic response status:', response.status)

        if (response.ok) {
          const content = data.content?.map(c => c.text || '').join('') || "Let's try again! 🌸"
          res.writeHead(200)
          res.end(JSON.stringify({ content }))
        } else {
          console.error('API Error:', data)
          res.writeHead(response.status)
          res.end(JSON.stringify({ error: data.error?.message || 'API error' }))
        }
      } catch (error) {
        console.error('Error:', error.message)
        res.writeHead(500)
        res.end(JSON.stringify({ error: error.message }))
      }
    })
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

server.listen(3001, () => {
  console.log('Dev API server running on http://localhost:3001')
  console.log('API endpoint: http://localhost:3001/api/chat')
})
