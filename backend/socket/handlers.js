const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`)

    // Authenticate socket connection
    socket.on("authenticate", (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        socket.userId = decoded.id
        socket.userRole = decoded.role
        socket.username = decoded.username
        socket.join(`user_${decoded.id}`)

        console.log(`✅ User ${decoded.username} (${decoded.role}) authenticated and joined room user_${decoded.id}`)
        socket.emit("authenticated", { success: true, user: decoded })
      } catch (err) {
        console.error("❌ Socket authentication failed:", err.message)
        socket.emit("authentication_error", { error: "Invalid token" })
      }
    })

    // Handle joining specific rooms
    socket.on("join_room", (room) => {
      if (socket.userId) {
        socket.join(room)
        console.log(`👥 User ${socket.username} joined room: ${room}`)
        socket.emit("room_joined", { room })
      } else {
        socket.emit("error", { message: "Not authenticated" })
      }
    })

    // Handle leaving specific rooms
    socket.on("leave_room", (room) => {
      if (socket.userId) {
        socket.leave(room)
        console.log(`👋 User ${socket.username} left room: ${room}`)
        socket.emit("room_left", { room })
      }
    })

    // Handle ping/pong for connection health
    socket.on("ping", () => {
      socket.emit("pong")
    })

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      if (socket.username) {
        console.log(`🔌 User ${socket.username} disconnected: ${reason}`)
      } else {
        console.log(`🔌 Client ${socket.id} disconnected: ${reason}`)
      }
    })

    // Handle connection errors
    socket.on("error", (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error)
    })

    // Send welcome message
    socket.emit("welcome", {
      message: "Connected to Medication Management System",
      timestamp: new Date().toISOString(),
    })
  })

  // Handle server-level socket errors
  io.engine.on("connection_error", (err) => {
    console.error("❌ Socket.IO connection error:", err.message)
  })

  console.log("✅ Socket handlers configured")
}

module.exports = { setupSocketHandlers }
