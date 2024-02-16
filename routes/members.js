const express = require('express');
const router = express.Router();
const Member = require('../models/member');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const member = await Member.findByUsername(username);

    if (!member || member.password !== password) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: member.id }, 'tu_secreto_jwt', { expiresIn: '1h' });
    res.json({ accessToken: token, member });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const members = await Member.getAll(token);
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', upload.single('profile_picture'), async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const memberData = req.body;
    memberData.profile_picture = {
      name: req.file.originalname,
      data: req.file.buffer
    };
    const newMember = await Member.create(memberData, token);
    res.status(201).json(newMember);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const deletedMember = await Member.delete(req.params.id, token);
    res.json(deletedMember);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const updatedMember = await Member.update(req.params.id, req.body, token);
    res.json(updatedMember);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;