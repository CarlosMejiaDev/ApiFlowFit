const express = require('express');
const router = express.Router();
const Category = require('../models/categorie');

router.get('/', async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    const categories = await Category.getAll(token);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    const newCategory = await Category.create(req.body, token);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    const deletedCategory = await Category.delete(req.params.id, token);
    res.json(deletedCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    const updatedCategory = await Category.update(req.params.id, req.body, token);
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;