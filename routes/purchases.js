// routes/purchases.js

const express = require('express');
const router = express.Router();
const Purchase = require('../models/purchase');

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const purchases = await Purchase.getAll(token);
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const newPurchase = await Purchase.create(req.body, token);
    res.status(201).json(newPurchase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/member', async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const newPurchase = await Purchase.createByMember(req.body.purchase, token, req.body.stripeToken);
      res.status(201).json(newPurchase);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const deletedPurchase = await Purchase.delete(req.params.id, token);
    res.json(deletedPurchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const updatedPurchase = await Purchase.update(req.params.id, req.body, token);
    res.json(updatedPurchase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;