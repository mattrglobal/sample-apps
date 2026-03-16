import net from 'net'

const PORT = process.env.PORT || 7313

const server = net.createServer()
server.once('error', () => {
  console.error(`Port ${PORT} is already in use. Please use another port via the PORT environment variable.`)
  process.exit(1)
})
server.once('listening', () => server.close())
server.listen(PORT)
