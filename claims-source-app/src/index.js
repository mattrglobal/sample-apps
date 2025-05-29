import fs from 'fs'
import 'dotenv/config'
import express from 'express'

const database = JSON.parse(fs.readFileSync("database.json"))

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

app.listen(3000, async () => {})
