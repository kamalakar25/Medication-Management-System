const path = require("path")
const fs = require("fs")

let db
let dbType
let isAsync = false

// Try better-sqlite3 first, then sqlite3
function initializeDB() {
  const dbPath = path.join(__dirname, "../database.sqlite")
  const dbDir = path.dirname(dbPath)

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  try {
    // Try better-sqlite3 first
    const Database = require("better-sqlite3")
    db = new Database(dbPath)
    dbType = "better-sqlite3"
    isAsync = false
    console.log("✅ Using better-sqlite3")
  } catch (error) {
    console.log("⚠️ better-sqlite3 not available, trying sqlite3...")

    try {
      const sqlite3 = require("sqlite3").verbose()
      db = new sqlite3.Database(dbPath)
      dbType = "sqlite3"
      isAsync = true
      console.log("✅ Using sqlite3")
    } catch (sqlite3Error) {
      console.error("❌ Neither better-sqlite3 nor sqlite3 could be loaded")
      console.error("better-sqlite3 error:", error.message)
      console.error("sqlite3 error:", sqlite3Error.message)
      process.exit(1)
    }
  }
}

const initializeDatabase = () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'patient',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`,
    `CREATE TABLE IF NOT EXISTS medication_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medication_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      taken_at DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      photo_url TEXT,
      FOREIGN KEY (medication_id) REFERENCES medications (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(medication_id, taken_at)
    )`,
    `CREATE TABLE IF NOT EXISTS patient_caretaker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      caretaker_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users (id),
      FOREIGN KEY (caretaker_id) REFERENCES users (id),
      UNIQUE(patient_id, caretaker_id)
    )`,
  ]

  if (dbType === "better-sqlite3") {
    db.pragma("foreign_keys = ON")
    tables.forEach((table) => {
      try {
        db.exec(table)
      } catch (error) {
        console.error("Error creating table:", error.message)
      }
    })
  } else {
    db.serialize(() => {
      tables.forEach((table) => {
        db.run(table, (err) => {
          if (err) {
            console.error("Error creating table:", err.message)
          }
        })
      })
    })
  }

  console.log("✅ Database tables initialized")
}

// Unified API that works with both libraries
const dbAPI = {
  run: (sql, params = [], callback) => {
    if (dbType === "better-sqlite3") {
      try {
        const stmt = db.prepare(sql)
        const result = stmt.run(params)
        const context = {
          lastID: result.lastInsertRowid,
          changes: result.changes,
        }
        if (callback) {
          setImmediate(() => callback.call(context, null))
        }
        return context
      } catch (error) {
        if (callback) {
          setImmediate(() => callback(error))
        } else {
          throw error
        }
      }
    } else {
      return db.run(sql, params, callback)
    }
  },

  get: (sql, params = [], callback) => {
    if (dbType === "better-sqlite3") {
      try {
        const stmt = db.prepare(sql)
        const result = stmt.get(params)
        if (callback) {
          setImmediate(() => callback(null, result))
        }
        return result
      } catch (error) {
        if (callback) {
          setImmediate(() => callback(error))
        } else {
          throw error
        }
      }
    } else {
      return db.get(sql, params, callback)
    }
  },

  all: (sql, params = [], callback) => {
    if (dbType === "better-sqlite3") {
      try {
        const stmt = db.prepare(sql)
        const result = stmt.all(params)
        if (callback) {
          setImmediate(() => callback(null, result))
        }
        return result
      } catch (error) {
        if (callback) {
          setImmediate(() => callback(error))
        } else {
          throw error
        }
      }
    } else {
      return db.all(sql, params, callback)
    }
  },

  serialize: (callback) => {
    if (dbType === "better-sqlite3") {
      if (callback) callback()
    } else {
      db.serialize(callback)
    }
  },

  close: () => {
    if (db && db.close) {
      db.close()
    }
  },
}

// Initialize the database
initializeDB()

module.exports = { db: dbAPI, initializeDatabase, dbType }
