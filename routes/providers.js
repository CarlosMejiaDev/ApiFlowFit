const express = require('express');
const router = express.Router();
const Provider = require('../models/provider');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const providers = await Provider.getAll(token);
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', upload.single('image_path'), async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const providerData = req.body;
    providerData.image_path = {
      name: req.file.originalname,
      data: req.file.buffer
    };
    const newProvider = await Provider.create(providerData, token);
    res.status(201).json(newProvider);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const deletedProvider = await Provider.delete(req.params.id, token);
    if (deletedProvider === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json({ message: 'Provider deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const updatedProvider = await Provider.update(req.params.id, req.body, token);
    if (updatedProvider === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json({ message: 'Provider updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;