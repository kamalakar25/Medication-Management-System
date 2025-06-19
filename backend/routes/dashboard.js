const express = require("express");
const { db } = require("../config/database");

const router = express.Router();

// Get dashboard statistics
router.get("/stats", (req, res) => {
  // Get total medications count
  db.get(
    "SELECT COUNT(*) as total FROM medications WHERE user_id = ?",
    [req.user.id],
    (err, totalMeds) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Get today's taken medications count
      const today = new Date().toISOString().split("T")[0];
      db.get(
        `SELECT COUNT(*) as taken FROM medication_logs ml
         JOIN medications m ON ml.medication_id = m.id
         WHERE m.user_id = ? AND ml.taken_at = ?`,
        [req.user.id, today],
        (err, takenToday) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          // Get adherence data for the past 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

          db.all(
            `SELECT ml.taken_at, COUNT(*) as count
           FROM medication_logs ml
           JOIN medications m ON ml.medication_id = m.id
           WHERE m.user_id = ? AND ml.taken_at >= ?
           GROUP BY ml.taken_at
           ORDER BY ml.taken_at ASC`,
            [req.user.id, sevenDaysAgoStr],
            (err, dailyLogs) => {
              if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
              }

              // Calculate adherence rate
              const adherenceRate =
                totalMeds.total > 0
                  ? Math.round((takenToday.taken / totalMeds.total) * 100)
                  : 0;

              // Calculate streak (consecutive days with all medications taken)
              const calculateStreak = async () => {
                let streakCount = 0;
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);

                const checkDate = (date) => {
                  return new Promise((resolve) => {
                    const dateStr = date.toISOString().split("T")[0];
                    db.get(
                      `SELECT COUNT(*) as taken, (SELECT COUNT(*) FROM medications WHERE user_id = ?) as total
                     FROM medication_logs ml
                     JOIN medications m ON ml.medication_id = m.id
                     WHERE m.user_id = ? AND ml.taken_at = ?`,
                      [req.user.id, req.user.id, dateStr],
                      (err, result) => {
                        if (
                          err ||
                          !result ||
                          result.total === 0 ||
                          result.taken < result.total
                        ) {
                          resolve(false);
                        } else {
                          resolve(true);
                        }
                      }
                    );
                  });
                };

                let checking = true;
                const checkingDate = new Date(currentDate);

                while (checking) {
                  const allTaken = await checkDate(checkingDate);
                  if (allTaken) {
                    streakCount++;
                    checkingDate.setDate(checkingDate.getDate() - 1);
                  } else {
                    checking = false;
                  }
                }

                return streakCount;
              };

              calculateStreak().then((streakCount) => {
                res.json({
                  totalMedications: totalMeds.total,
                  takenToday: takenToday.taken,
                  adherenceRate: adherenceRate,
                  streak: streakCount,
                  dailyLogs: dailyLogs,
                });
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
