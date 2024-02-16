// models/Workout.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');

class Workout {
  static async create(workout, token) {
    try {
      const connection = await mysql.createConnection(config);
      const adminID = jwt.verify(token, 'tu_secreto_jwt').id;
      const [result] = await connection.execute('INSERT INTO workouts (name, description, admin_id) VALUES (?, ?, ?)', [workout.name, workout.description, adminID]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const adminID = jwt.verify(token, 'tu_secreto_jwt').id;
      const [rows] = await connection.execute('SELECT * FROM workouts WHERE admin_id = ?', [adminID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Workout;