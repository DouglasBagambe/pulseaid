const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "ai", time: new Date().toISOString() });
});

app.post("/verify", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Missing file" });
    const name = (req.file.originalname || "").toLowerCase();
    if (name.includes("fake")) {
      return res.json({ score: 0.1, fraud: true });
    }
    return res.json({ score: 0.92, fraud: false });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "verification-failed" });
  }
});

const PORT = process.env.AI_PORT || 5001;
app.listen(PORT, () => console.log(`AI service on http://localhost:${PORT}`));
