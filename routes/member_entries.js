// routes/member_entries.js
const express = require('express');
const router = express.Router();  
const MemberEntry = require('../models/member_entry');

router.get('/member', async (req, res) => {
  try {
    const memberEntries = await MemberEntry.getMemberData(req.headers.authorization);
    res.json(memberEntries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin', async (req, res) => {
  try {
    const memberEntries = await MemberEntry.getAllData(req.headers.authorization);
    res.json(memberEntries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newMemberEntry = await MemberEntry.create(req.body, req.headers.authorization);
    res.status(201).json(newMemberEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;