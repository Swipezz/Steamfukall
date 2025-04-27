const express = require("express");
const cors = require("cors");
const app = express();
const checkerRoute = require("./routes/checker.js");
const path = require("path");
const fs = require("fs");
const { resett, receivePinFromApi } = require('./modules/checker.js');

const port = 5000;

app.use(cors());
app.use(express.json());

// Middleware untuk logging (opsional)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/', checkerRoute);

app.post("/api/pin", (req, res) => {
    const { username, pin } = req.body;
    if (!username || !pin) {
        return res.status(400).json({ error: 'Mohon berikan username dan PIN.' });
    }
    receivePinFromApi(username, pin);
    console.log(`PIN diterima dari website untuk ${username}: ${pin}`);
    res.status(200).json({ success: true, message: `PIN diterima untuk ${username}.` });
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
