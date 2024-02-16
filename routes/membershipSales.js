// routes/membershipSales.js

const express = require('express');
const router = express.Router();
const MembershipSale = require('../models/MembershipSale');
const jwt = require('jsonwebtoken');

router.post('/assign', async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
  
      const { member_id, membership_id, price } = req.body;
      const sale = {
        membership_id,
        admin_id: adminID,
        member_id,
        price
      };
  
      const newSale = await MembershipSale.create(sale);
      res.status(201).json(newSale);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'tu_secreto_jwt');
    const adminID = decoded.id;

    const sales = await MembershipSale.getAll(adminID);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'tu_secreto_jwt');
    const adminID = decoded.id;

    const newSale = await MembershipSale.create({ ...req.body, admin_id: adminID });
    res.status(201).json(newSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;