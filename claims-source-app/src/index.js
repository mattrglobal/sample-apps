import fs from 'fs'
import 'dotenv/config'
import express from 'express'

const database = JSON.parse(fs.readFileSync("database.json"))
const PORT = process.env.PORT || 7310

const app = express()

app.get('/claims', (req, res) => {
  // Protect the endpoint with an API key.
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.CLAIMS_SOURCE_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // The Claims source tutorial queries by `licenseNumber`. The Claim sets
  // tutorial queries by `recordId`, which MATTR VII maps from the claim set
  // identifier on the credential offer.
  const { licenseNumber, recordId } = req.query;

  // Query your database. In a production use case, you would connect
  // to your user database, we are simply searching in a local JSON file.
  if (recordId) {
    const record = database.find((record) => record.recordId === recordId)

    // Return an empty object when the record is not in the database yet, so
    // that MATTR VII issues the credential using claims supplied on the offer.
    if (!record) {
      console.log(`No record found with recordId "${recordId}", returning no claims`)
      return res.json({})
    }

    console.log(`Returning record data for "${recordId}"`);
    console.log(record)
    return res.json(record)
  }

  const user = database.find((user) => user.licenseNumber === licenseNumber)

  // Return 404 Not Found when there is no user with the provided license
  // number.
  if (!user) {
    console.error(`User not found with licenseNumber "${licenseNumber}"`)
    return res.status(404).json({ error: "User not found" });
  }

  // Debug logs for the user data that are return to be used as claims.
  console.log(`Returning user data for "${licenseNumber}"`);
  console.log(user)

  res.json(user)
})

/* Start claims source app */
const server = app.listen(PORT, () => {
  console.log(`Claims source app listening on port ${PORT}`)
})

/* Register an error listener for debugging purposes */
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use another port via the PORT environment variable.`)
  } else {
    console.error('Server error:', error.message)
  }
  process.exit(1)
})
