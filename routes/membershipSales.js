// routes/membershipSales.js

const express = require('express');
const router = express.Router();
const MembershipSale = require('../models/MembershipSale');

router.post('/assign', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const { member_id, membership_id, price } = req.body;
    const sale = {
      membership_id,
      member_id,
      price
    };

    const newSale = await MembershipSale.create(sale, token);
    res.status(201).json(newSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const sales = await MembershipSale.getAll(token);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const newSale = await MembershipSale.create(req.body, token);
    res.status(201).json(newSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;