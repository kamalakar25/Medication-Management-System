import { io } from "socket.io-client"

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = {}
  }

  connect() {
    if (this.socket) return

    this.socket = io(SOCKET_URL)

    this.socket.on("connect", () => {
      console.log("Socket connected")
      this.authenticate()
    })

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })
  }

  authenticate() {
    const token = localStorage.getItem("token")
    if (token) {
      this.socket.emit("authenticate", token)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event, callback) {
    if (!this.socket) this.connect()

    this.socket.on(event, callback)

    // Store the listener for cleanup
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)

    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (!this.socket) return

    if (callback) {
      this.socket.off(event, callback)
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
      }
    } else {
      this.socket.off(event)
      delete this.listeners[event]
    }
  }

  removeAllListeners() {
    if (!this.socket) return

    Object.keys(this.listeners).forEach((event) => {
      this.listeners[event].forEach((callback) => {
        this.socket.off(event, callback)
      })
      delete this.listeners[event]
    })
  }
}

const socketService = new SocketService()

export default socketService
