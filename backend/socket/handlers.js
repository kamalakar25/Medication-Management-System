const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Authenticate socket connection
    socket.on("authenticate", (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.join(`user_${decoded.id}`);
        console.log(
          `User ${decoded.id} authenticated and joined room user_${decoded.id}`
        );
        socket.emit("authenticated", { success: true });
      } catch (err) {
        console.error("Socket authentication failed:", err.message);
        socket.emit("authentication_error", { error: "Invalid token" });
      }
    });

    // Handle joining specific rooms
    socket.on("join_room", (room) => {
      if (socket.userId) {
        socket.join(room);
        console.log(`User ${socket.userId} joined room: ${room}`);
      }
    });

    // Handle leaving specific rooms
    socket.on("leave_room", (room) => {
      if (socket.userId) {
        socket.leave(room);
        console.log(`User ${socket.userId} left room: ${room}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};

module.exports = { setupSocketHandlers };
