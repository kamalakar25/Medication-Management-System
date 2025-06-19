const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "../database.sqlite");

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

const initializeDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'patient',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Medications table
    db.run(`CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Medication logs table
    db.run(`CREATE TABLE IF NOT EXISTS medication_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medication_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      taken_at DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      photo_url TEXT,
      FOREIGN KEY (medication_id) REFERENCES medications (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(medication_id, taken_at)
    )`);

    // Patient-Caretaker relationships table
    db.run(`CREATE TABLE IF NOT EXISTS patient_caretaker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      caretaker_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users (id),
      FOREIGN KEY (caretaker_id) REFERENCES users (id),
      UNIQUE(patient_id, caretaker_id)
    )`);

    console.log("Database tables initialized");
  });
};

module.exports = { db, initializeDatabase };
