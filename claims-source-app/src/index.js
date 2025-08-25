import fs from 'fs'
import 'dotenv/config'
import express from 'express'
import net from 'net'

const database = JSON.parse(fs.readFileSync("database.json"))
const PORT = process.env.PORT || 3000

// Function to check if port is available
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.once('close', () => resolve(true))
      server.close()
    })
    server.on('error', () => resolve(false))
  })
}

// Function to find available port starting from given port
async function findAvailablePort(startPort) {
  let port = startPort
  while (!(await checkPortAvailable(port))) {
    port++
    if (port > startPort + 100) {
      throw new Error(`No available port found starting from ${startPort}`)
    }
  }
  return port
}

const app = express()

app.get('/claims', (req, res) => {
  // Protect the endpoint with an API key.
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.CLAIMS_SOURCE_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get the email form the request query.
  const { email } = req.query;

  // Query your database. In a production use case, you would connect
  // to your user database, we are simply searching in a local JSON file.
  const user = database.find((user) => user.email === email)

  // Return 404 Not Found when there is no user with the provided email
  // address.
  if (!user) {
    console.error(`User not found with email "${email}"`)
    return res.status(404).json({ error: "User not found" });
  }

  // Debug logs for the user data that are return to be used as claims.
  console.log(`Returning user data for "${email}"`);
  console.log(user)

  res.json(user)
})

// Start server with port conflict detection for default port
async function startServer() {
  let finalPort = PORT
  
  // If using default port 3000, check for conflicts and find alternative if needed
  if (PORT == 3000 && !process.env.PORT) {
    const isAvailable = await checkPortAvailable(3000)
    if (!isAvailable) {
      console.warn(`Port 3000 is already in use, finding alternative port...`)
      finalPort = await findAvailablePort(3001)
      console.warn(`Using port ${finalPort} instead`)
    }
  }
  
  app.listen(finalPort, () => {
    console.log(`Claims source app listening on port ${finalPort}`)
  })
  
  return finalPort
}

startServer().catch(console.error)
