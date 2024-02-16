// models/WorkoutExercise.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');

class WorkoutExercise {
  static async create(workoutExercise, token) {
    try {
      const connection = await mysql.createConnection(config);
      const memberID = jwt.verify(token, 'tu_secreto_jwt').id;
      const [result] = await connection.execute('INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, rest, member_id) VALUES (?, ?, ?, ?, ?, ?)', [workoutExercise.workout_id, workoutExercise.exercise_id, workoutExercise.sets, workoutExercise.reps, workoutExercise.rest, memberID]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const memberID = jwt.verify(token, 'tu_secreto_jwt').id;
      const [rows] = await connection.execute('SELECT * FROM workout_exercises WHERE member_id = ?', [memberID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = WorkoutExercise;