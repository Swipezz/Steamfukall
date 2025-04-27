const express = require("express");
const router = express.Router();
const steamChecker = require("../modules/checker");
const path = require('path');

router.use(express.static(path.join(__dirname, '../modules')));

// Endpoint untuk mengecek satu akun
router.post("/check-single", express.json(), async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Mohon berikan username dan password." });
  }

  const checkResult = await steamChecker.checkAccount(username, password);
  res.json({
    message: "Pengecekan akun selesai.",
    result: { username, status: checkResult },
  });
});

// Endpoint untuk menjalankan pengecekan semua akun dari array di dalam module checker (POST request)
router.post("/start", async (req, res) => {
  const { username, password } = req.body;
  steamChecker.startCheckingInternal(username, password);
  res.json({
    message: "Pengecekan semua akun dimulai (cek konsol untuk detail).",
  });
});




module.exports = router;
