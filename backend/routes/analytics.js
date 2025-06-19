const express = require("express");
const { db } = require("../config/database");

const router = express.Router();

// Get adherence analytics
router.get("/adherence", (req, res) => {
  const { period = "week" } = req.query;
  let startDate;

  const now = new Date();
  if (period === "week") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === "year") {
    startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - 1);
  } else {
    return res
      .status(400)
      .json({ error: "Invalid period. Use 'week', 'month', or 'year'." });
  }

  const startDateStr = startDate.toISOString().split("T")[0];

  // Get all medications for the user
  db.all(
    "SELECT * FROM medications WHERE user_id = ?",
    [req.user.id],
    (err, medications) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (medications.length === 0) {
        return res.json({
          adherenceRate: 0,
          medicationAdherence: [],
          dailyAdherence: [],
        });
      }

      // Get all medication logs for the period
      db.all(
        `SELECT ml.* FROM medication_logs ml
       JOIN medications m ON ml.medication_id = m.id
       WHERE m.user_id = ? AND ml.taken_at >= ?
       ORDER BY ml.taken_at ASC`,
        [req.user.id, startDateStr],
        (err, logs) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          // Calculate adherence by medication
          const medicationAdherence = medications.map((medication) => {
            const medicationLogs = logs.filter(
              (log) => log.medication_id === medication.id
            );
            const daysInPeriod = Math.ceil(
              (now - startDate) / (1000 * 60 * 60 * 24)
            );
            const adherenceRate = (medicationLogs.length / daysInPeriod) * 100;

            return {
              id: medication.id,
              name: medication.name,
              adherenceRate: Math.round(adherenceRate),
              totalTaken: medicationLogs.length,
              expectedTaken: daysInPeriod,
            };
          });

          // Calculate daily adherence
          const dailyAdherence = [];
          const currentDate = new Date(startDate);

          while (currentDate <= now) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const dayLogs = logs.filter((log) => log.taken_at === dateStr);
            const takenCount = dayLogs.length;
            const adherenceRate = (takenCount / medications.length) * 100;

            dailyAdherence.push({
              date: dateStr,
              adherenceRate: Math.round(adherenceRate),
              taken: takenCount,
              total: medications.length,
            });

            currentDate.setDate(currentDate.getDate() + 1);
          }

          // Calculate overall adherence rate
          const totalExpectedTaken =
            medications.length *
            Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
          const overallAdherenceRate =
            totalExpectedTaken > 0
              ? Math.round((logs.length / totalExpectedTaken) * 100)
              : 0;

          res.json({
            adherenceRate: overallAdherenceRate,
            medicationAdherence,
            dailyAdherence,
          });
        }
      );
    }
  );
});

module.exports = router;
