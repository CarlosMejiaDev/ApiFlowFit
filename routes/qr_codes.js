// routes/qr_codes.js
const express = require('express');
const router = express.Router();
const QrCode = require('../models/qr_code');

router.get('/', async (req, res) => {
  try {
    const qrCodes = await QrCode.getAll(req.headers.authorization);
    res.json(qrCodes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newQrCode = await QrCode.create(req.body, req.headers.authorization);
    res.status(201).json(newQrCode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;