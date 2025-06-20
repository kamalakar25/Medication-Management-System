const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { db } = require("../config/database")
const { sanitizeInput, validateEmail, validatePassword, validateUsername } = require("../utils/validation")

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role = "patient" } = req.body

    // Input validation
    if (!validateUsername(username)) {
      return res.status(400).json({ error: "Username must be at least 3 characters long" })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" })
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username)
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedRole = sanitizeInput(role)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert user
    db.run(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [sanitizedUsername, sanitizedEmail, hashedPassword, sanitizedRole],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ error: "Username or email already exists" })
          }
          console.error("Database error:", err)
          return res.status(500).json({ error: "Database error" })
        }

        const token = jwt.sign({ id: this.lastID, username: sanitizedUsername, role: sanitizedRole }, JWT_SECRET, {
          expiresIn: "24h",
        })

        res.status(201).json({
          message: "User created successfully",
          token,
          user: { id: this.lastID, username: sanitizedUsername, email: sanitizedEmail, role: sanitizedRole },
        })
      },
    )
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Login route - Updated to accept username or email
router.post("/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: "Username/Email and password are required" })
    }

    const sanitizedUsernameOrEmail = sanitizeInput(usernameOrEmail)

    // Check if input is email or username
    const isEmail = validateEmail(sanitizedUsernameOrEmail)
    const query = isEmail ? "SELECT * FROM users WHERE email = ?" : "SELECT * FROM users WHERE username = ?"

    db.get(query, [sanitizedUsernameOrEmail], async (err, user) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Database error" })
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
        expiresIn: "24h",
      })

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      })
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
