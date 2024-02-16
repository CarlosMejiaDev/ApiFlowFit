// routes/workoutExercises.js

const express = require('express');
const router = express.Router();
const WorkoutExercise = require('../models/WorkoutExercise');

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const workoutExercises = await WorkoutExercise.getAll(token);
    res.json(workoutExercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const newWorkoutExercise = await WorkoutExercise.create(req.body, token);
    res.status(201).json(newWorkoutExercise);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;