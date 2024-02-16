const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findByUsername(username);
    if (!admin || password !== admin.password) {
      return res.status(401).json({ error: 'Credenciales inálidas' });
    }

    const token = jwt.sign({ id: admin.id }, 'tu_secreto_jwt', { expiresIn: '1h' });
    res.json({ accessToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, first_name, last_name, email, password, birth_date } = req.body;
    const adminId = await Admin.register(username, first_name, last_name, email, password, birth_date);
    const admin = await Admin.findByUsername(username);
    const token = jwt.sign({ id: admin.id }, 'tu_secreto_jwt', { expiresIn: '1h' });
    res.json({ accessToken: token, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;