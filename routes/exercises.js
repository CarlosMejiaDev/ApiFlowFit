// routes/exercises.js

const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise');

// POST /exercises - Crea un nuevo ejercicio
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const exercise = req.body;
    const result = await Exercise.create(exercise, token);
    res.json({ message: 'Exercise created successfully', result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /exercises - Obtiene todos los ejercicios
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const exercises = await Exercise.getAll(token);
    res.json(exercises);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /exercises/:id - Obtiene un ejercicio por su ID
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const exercise = await Exercise.getById(req.params.id, token);
    res.json(exercise);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /exercises/:id - Actualiza un ejercicio por su ID
router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const exercise = req.body;
    const result = await Exercise.updateById(req.params.id, exercise, token);
    res.json({ message: 'Exercise updated successfully', result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /exercises/:id - Elimina un ejercicio por su ID
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const result = await Exercise.deleteById(req.params.id, token);
    res.json({ message: 'Exercise deleted successfully', result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;