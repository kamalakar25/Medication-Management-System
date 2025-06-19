const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Upload medication photo
router.post("/medication-photo", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const photoUrl = `/uploads/${req.file.filename}`;

  res.json({
    message: "Photo uploaded successfully",
    photoUrl: photoUrl,
    filename: req.file.filename,
  });
});

// Get medication photos
router.get("/medication-photos/:medicationLogId", (req, res) => {
  // This would typically fetch photos associated with a medication log
  // For now, we'll return a placeholder response
  res.json({
    photos: [],
  });
});

module.exports = router;
