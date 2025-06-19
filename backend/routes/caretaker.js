const express = require("express")
const { db } = require("../config/database")
const { sanitizeInput } = require("../utils/validation")

const router = express.Router()

// Get all patients for caretaker
router.get("/patients", (req, res) => {
  if (req.user.role !== "caretaker") {
    return res.status(403).json({ error: "Access denied. Caretaker role required." })
  }

  db.all(
    `SELECT u.id, u.username, u.email FROM users u
     JOIN patient_caretaker pc ON u.id = pc.patient_id
     WHERE pc.caretaker_id = ?`,
    [req.user.id],
    (err, patients) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Database error" })
      }
      res.json(patients)
    },
  )
})

// Add patient to caretaker
router.post("/patients", (req, res) => {
  if (req.user.role !== "caretaker") {
    return res.status(403).json({ error: "Access denied. Caretaker role required." })
  }

  const { patientUsername } = req.body

  if (!patientUsername) {
    return res.status(400).json({ error: "Patient username is required" })
  }

  const sanitizedPatientUsername = sanitizeInput(patientUsername)

  // Find the patient by username
  db.get("SELECT * FROM users WHERE username = ? AND role = 'patient'", [sanitizedPatientUsername], (err, patient) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Database error" })
    }

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" })
    }

    // Check if relationship already exists
    db.get(
      "SELECT * FROM patient_caretaker WHERE patient_id = ? AND caretaker_id = ?",
      [patient.id, req.user.id],
      (err, relationship) => {
        if (err) {
          console.error("Database error:", err)
          return res.status(500).json({ error: "Database error" })
        }

        if (relationship) {
          return res.status(400).json({ error: "You are already a caretaker for this patient" })
        }

        // Create the relationship
        db.run(
          "INSERT INTO patient_caretaker (patient_id, caretaker_id) VALUES (?, ?)",
          [patient.id, req.user.id],
          (err) => {
            if (err) {
              console.error("Database error:", err)
              return res.status(500).json({ error: "Database error" })
            }

            // Notify the patient
            req.io.to(`user_${patient.id}`).emit("caretaker_added", {
              caretaker_id: req.user.id,
              caretaker_username: req.user.username,
            })

            res.status(201).json({
              message: "Patient added successfully",
              patient: {
                id: patient.id,
                username: patient.username,
                email: patient.email,
              },
            })
          },
        )
      },
    )
  })
})

// Get patient medications - ensure parameters are properly named
router.get("/patients/:patientId/medications", (req, res) => {
  if (req.user.role !== "caretaker") {
    return res.status(403).json({ error: "Access denied. Caretaker role required." })
  }

  const patientId = req.params.patientId

  // Verify caretaker-patient relationship
  db.get(
    "SELECT * FROM patient_caretaker WHERE patient_id = ? AND caretaker_id = ?",
    [patientId, req.user.id],
    (err, relationship) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Database error" })
      }

      if (!relationship) {
        return res.status(403).json({ error: "You are not authorized to view this patient's medications" })
      }

      // Get patient's medications
      db.all(
        "SELECT * FROM medications WHERE user_id = ? ORDER BY created_at DESC",
        [patientId],
        (err, medications) => {
          if (err) {
            console.error("Database error:", err)
            return res.status(500).json({ error: "Database error" })
          }
          res.json(medications)
        },
      )
    },
  )
})

// Mark patient medication as taken - ensure parameters are properly named
router.post("/patients/:patientId/medications/:medicationId/mark-taken", (req, res) => {
  if (req.user.role !== "caretaker") {
    return res.status(403).json({ error: "Access denied. Caretaker role required." })
  }

  const patientId = req.params.patientId
  const medicationId = req.params.medicationId
  const { date } = req.body

  if (!date) {
    return res.status(400).json({ error: "Date is required" })
  }

  // Verify caretaker-patient relationship
  db.get(
    "SELECT * FROM patient_caretaker WHERE patient_id = ? AND caretaker_id = ?",
    [patientId, req.user.id],
    (err, relationship) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Database error" })
      }

      if (!relationship) {
        return res.status(403).json({ error: "You are not authorized to manage this patient's medications" })
      }

      // Verify the medication belongs to the patient
      db.get("SELECT * FROM medications WHERE id = ? AND user_id = ?", [medicationId, patientId], (err, medication) => {
        if (err) {
          console.error("Database error:", err)
          return res.status(500).json({ error: "Database error" })
        }

        if (!medication) {
          return res.status(404).json({ error: "Medication not found" })
        }

        // Insert or update medication log
        db.run(
          "INSERT OR REPLACE INTO medication_logs (medication_id, user_id, taken_at) VALUES (?, ?, ?)",
          [medicationId, patientId, date],
          function (err) {
            if (err) {
              console.error("Database error:", err)
              return res.status(500).json({ error: "Database error" })
            }

            const logEntry = {
              id: this.lastID,
              medication_id: Number.parseInt(medicationId),
              user_id: Number.parseInt(patientId),
              taken_at: date,
              marked_by_caretaker: true,
              caretaker_id: req.user.id,
              caretaker_username: req.user.username,
            }

            // Emit real-time update to patient
            req.io.to(`user_${patientId}`).emit("medication_taken_by_caretaker", {
              ...logEntry,
              medication_name: medication.name,
            })

            res.json({
              message: "Medication marked as taken",
              log: logEntry,
            })
          },
        )
      })
    },
  )
})

module.exports = router
