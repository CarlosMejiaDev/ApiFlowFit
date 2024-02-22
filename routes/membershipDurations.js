// routes/membershipDurations.js

const express = require('express');
const router = express.Router();
const MembershipDuration = require('../models/membershipDuration');

router.get('/:membershipId', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const durations = await MembershipDuration.getAllByMembershipId(token);
    res.json(durations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const newDuration = await MembershipDuration.create(token, req.body);
    res.status(201).json(newDuration);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    await MembershipDuration.delete(token, req.params.id);
    res.json({ message: 'Deleted Membership Duration' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const updatedDuration = await MembershipDuration.update(token, req.params.id, req.body);
    res.json(updatedDuration);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;