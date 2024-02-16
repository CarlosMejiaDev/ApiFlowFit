const express = require('express');
const router = express.Router();
const Membership = require('../models/membership');

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const memberships = await Membership.getAll(token);
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const newMembership = await Membership.create(req.body, token);
    res.status(201).json(newMembership);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const deletedMembership = await Membership.delete(req.params.id, token);
    res.json(deletedMembership);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const updatedMembership = await Membership.update(req.params.id, req.body, token);
    res.json(updatedMembership);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;