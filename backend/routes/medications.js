const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { db } = require("../config/database")
const { sanitizeInput, validateMedication } = require("../utils/validation")

const router = express.Router()

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// Get all medications for user
router.get("/", (req, res) => {
  db.all("SELECT * FROM medications WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, medications) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Database error" })
    }
    res.json(medications)
  })
})

// Add new medication
router.post("/", (req, res) => {
  const { name, dosage, frequency } = req.body

  if (!validateMedication({ name, dosage, frequency })) {
    return res.status(400).json({ error: "All fields are required" })
  }

  const sanitizedName = sanitizeInput(name)
  const sanitizedDosage = sanitizeInput(dosage)
  const sanitizedFrequency = sanitizeInput(frequency)

  db.run(
    "INSERT INTO medications (user_id, name, dosage, frequency) VALUES (?, ?, ?, ?)",
    [req.user.id, sanitizedName, sanitizedDosage, sanitizedFrequency],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Database error" })
      }

      const newMedication = {
        id: this.lastID,
        user_id: req.user.id,
        name: sanitizedName,
        dosage: sanitizedDosage,
        frequency: sanitizedFrequency,
      }

      // Emit real-time update
      req.io.to(`user_${req.user.id}`).emit("medication_added", newMedication)

      // If user is a patient, notify caretakers
      if (req.user.role === "patient") {
        db.all("SELECT caretaker_id FROM patient_caretaker WHERE patient_id = ?", [req.user.id], (err, caretakers) => {
          if (!err && caretakers) {
            caretakers.forEach((caretaker) => {
              req.io.to(`user_${caretaker.caretaker_id}`).emit("patient_medication_added", {
                ...newMedication,
                patient_id: req.user.id,
                patient_username: req.user.username,
              })
            })
          }
        })
      }

      res.status(201).json({
        ...newMedication,
        message: "Medication added successfully",
      })
    },
  )
})

// Update medication - ensure the parameter is properly named
router.put("/:id", (req, res) => {
  const medicationId = req.params.id
  const { name, dosage, frequency } = req.body

  if (!validateMedication({ name, dosage, frequency })) {
    return res.status(400).json({ error: "All fields are required" })
  }

  const sanitizedName = sanitizeInput(name)
  const sanitizedDosage = sanitizeInput(dosage)
  const sanitizedFrequency = sanitizeInput(frequency)

  // First verify the medication belongs to the user
  db.get("SELECT * FROM medications WHERE id = ? AND user_id = ?", [medicationId, req.user.id], (err, medication) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Database error" })
    }

    if (!medication) {
      return res.status(404).json({ error: "Medication not found" })
    }

    // Update the medication
    db.run(
      "UPDATE medications SET name = ?, dosage = ?, frequency = ? WHERE id = ? AND user_id = ?",
      [sanitizedName, sanitizedDosage, sanitizedFrequency, medicationId, req.user.id],
      (err) => {
        if (err) {
          console.error("Database error:", err)
          return res.status(500).json({ error: "Database error" })
        }

        const updatedMedication = {
          id: Number.parseInt(medicationId),
          user_id: req.user.id,
          name: sanitizedName,
          dosage: sanitizedDosage,
          frequency: sanitizedFrequency,
        }

        // Emit real-time update
        req.io.to(`user_${req.user.id}`).emit("medication_updated", updatedMedication)

        // If user is a patient, notify caretakers
        if (req.user.role === "patient") {
          db.all(
            "SELECT caretaker_id FROM patient_caretaker WHERE patient_id = ?",
            [req.user.id],
            (err, caretakers) => {
              if (!err && caretakers) {
                caretakers.forEach((caretaker) => {
                  req.io.to(`user_${caretaker.caretaker_id}`).emit("patient_medication_updated", {
                    ...updatedMedication,
                    patient_id: req.user.id,
                    patient_username: req.user.username,
                  })
                })
              }
            },
          )
        }

        res.json({
          ...updatedMedication,
          message: "Medication updated successfully",
        })
      },
    )
  })
})

// Delete medication - ensure the parameter is properly named
router.delete("/:id", (req, res) => {
  const medicationId = req.params.id

  // First verify the medication belongs to the user
  db.get("SELECT * FROM medications WHERE id = ? AND user_id = ?", [medicationId, req.user.id], (err, medication) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Database error" })
    }

    if (!medication) {
      return res.status(404).json({ error: "Medication not found" })
    }

    // Delete related medication logs first
    db.run("DELETE FROM medication_logs WHERE medication_id = ?", [medicationId], (err) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Database error" })
      }

      // Then delete the medication
      db.run("DELETE FROM medications WHERE id = ? AND user_id = ?", [medicationId, req.user.id], (err) => {
        if (err) {
          console.error("Database error:", err)
          return res.status(500).json({ error: "Database error" })
        }

        // Emit real-time update
        req.io.to(`user_${req.user.id}`).emit("medication_deleted", { id: Number.parseInt(medicationId) })

        // If user is a patient, notify caretakers
        if (req.user.role === "patient") {
          db.all(
            "SELECT caretaker_id FROM patient_caretaker WHERE patient_id = ?",
            [req.user.id],
            (err, caretakers) => {
              if (!err && caretakers) {
                caretakers.forEach((caretaker) => {
                  req.io.to(`user_${caretaker.caretaker_id}`).emit("patient_medication_deleted", {
                    id: Number.parseInt(medicationId),
                    patient_id: req.user.id,
                    patient_username: req.user.username,
                  })
                })
              }
            },
          )
        }

        res.json({ message: "Medication deleted successfully" })
      })
    })
  })
})

// Mark medication as taken - ensure parameters are properly named
router.post("/:id/mark-taken", upload.single("photo"), (req, res) => {
  const medicationId = req.params.id
  const { date } = req.body
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null

  if (!date) {
    return res.status(400).json({ error: "Date is required" })
  }

  // First verify the medication belongs to the user
  db.get("SELECT * FROM medications WHERE id = ? AND user_id = ?", [medicationId, req.user.id], (err, medication) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Database error" })
    }

    if (!medication) {
      return res.status(404).json({ error: "Medication not found" })
    }

    // Insert or update medication log
    db.run(
      "INSERT OR REPLACE INTO medication_logs (medication_id, user_id, taken_at, photo_url) VALUES (?, ?, ?, ?)",
      [medicationId, req.user.id, date, photoUrl],
      function (err) {
        if (err) {
          console.error("Database error:", err)
          return res.status(500).json({ error: "Database error" })
        }

        const logEntry = {
          id: this.lastID,
          medication_id: Number.parseInt(medicationId),
          user_id: req.user.id,
          taken_at: date,
          photo_url: photoUrl,
        }

        // Emit real-time update
        req.io.to(`user_${req.user.id}`).emit("medication_taken", {
          ...logEntry,
          medication_name: medication.name,
        })

        // If user is a patient, notify caretakers
        if (req.user.role === "patient") {
          db.all(
            "SELECT caretaker_id FROM patient_caretaker WHERE patient_id = ?",
            [req.user.id],
            (err, caretakers) => {
              if (!err && caretakers) {
                caretakers.forEach((caretaker) => {
                  req.io.to(`user_${caretaker.caretaker_id}`).emit("patient_medication_taken", {
                    ...logEntry,
                    medication_name: medication.name,
                    patient_id: req.user.id,
                    patient_username: req.user.username,
                  })
                })
              }
            },
          )
        }

        res.json({
          message: "Medication marked as taken",
          log: logEntry,
        })
      },
    )
  })
})

// Get medication logs - ensure parameters are properly named
router.get("/:id/logs", (req, res) => {
  const medicationId = req.params.id

  db.all(
    `SELECT ml.* FROM medication_logs ml 
     JOIN medications m ON ml.medication_id = m.id 
     WHERE ml.medication_id = ? AND m.user_id = ?
     ORDER BY ml.taken_at DESC`,
    [medicationId, req.user.id],
    (err, logs) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Database error" })
      }
      res.json(logs)
    },
  )
})

module.exports = router
