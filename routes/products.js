const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const products = await Product.getAll(token);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', upload.single('image_path'), async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const productData = req.body;
    productData.image_path = {
      name: req.file.originalname,
      data: req.file.buffer
    };
    const newProduct = await Product.create(productData, token);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const deletedProduct = await Product.delete(req.params.id, token);
    if (deletedProduct === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const updatedProduct = await Product.update(req.params.id, req.body, token);
    if (updatedProduct === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/sell', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const quantity = req.body.quantity;
    const soldProduct = await Product.sell(req.params.id, quantity, token);
    if (soldProduct === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product sold' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/restock', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const quantity = req.body.quantity;
    const restockedProduct = await Product.restock(req.params.id, quantity, token);
    if (restockedProduct === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product restocked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;