const express = require('express');
const router = express.Router();
const Member = require('../models/member');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const upload = multer({ storage: multer.memoryStorage() });
const stripe = require('stripe')('sk_test_51OounUGf0J9y3KivqLaSCWTvL6lRjYEHVGuLlHI4w3LTM3tZibUdnpg2e78M25e5t3ZgBuJ0rzA4qSraPCM2XGkR00oJ0ziAp0');

router.get('/activeMembers', async (req, res) => {
  try {
    const activeMembers = await Member.getActiveMembers();
    res.json(activeMembers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/inactiveMembers', async (req, res) => {
  try {
    const inactiveMembers = await Member.getInactiveMembers();
    res.json(inactiveMembers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/renew/:id', async (req, res) => {
  try {
    const { membershipId, isStripe, stripeToken } = req.body;
    const memberId = req.params.id;
    const token = req.headers.authorization.split(' ')[1]; // Assumes 'Bearer your_token'

    const result = await Member.reinscripcion(memberId, membershipId, isStripe, stripeToken, token);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const member = await Member.findByUsername(username);

    if (!member || member.password !== password) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: member.id, role: 'member' }, 'tu_secreto_jwt', { expiresIn: '1h' });
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

router.get('/registeredToday', async (req, res) => {
  try {
    const members = await Member.getRegisteredToday();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/totalMembers', async (req, res) => {
  try {
    const total = await Member.getTotalMembers();
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/expiringSoon', async (req, res) => {
  try {
    const members = await Member.getExpiringSoon();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/membersPerDay', async (req, res) => {
  try {
    const counts = await Member.getMembersPerDay();
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;