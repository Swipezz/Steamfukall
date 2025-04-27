const express = require("express");
const cors = require("cors");
const app = express();
const checkerRoute = require("./routes/checker.js");
const path = require("path");
const fs = require("fs");

const port = 5000;

app.use(cors());
app.use(express.json());

// Middleware untuk logging (opsional)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Gunakan route checker
app.use("/api/checker", checkerRoute);

// Membuat folder results jika belum ada
const resultsDir = path.join(__dirname, "results");
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

app.listen(port, () => {
  console.log(`Server API berjalan di http://localhost:${port}`);
});
