// routes/workouts.js

const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const workouts = await Workout.getAll(token);
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const newWorkout = await Workout.create(req.body, token);
    res.status(201).json(newWorkout);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;