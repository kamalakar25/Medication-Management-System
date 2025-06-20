const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("JWT verification failed:", err.message)
      return res.status(403).json({ error: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error("Authentication error: No token provided"))
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"))
    }
    socket.userId = decoded.id
    socket.userRole = decoded.role
    socket.username = decoded.username
    next()
  })
}

module.exports = { authenticateToken, authenticateSocket }
