// models/membershipDuration.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');

class MembershipDuration {
  static async getAllByMembershipId(token) {
    try {
      const connection = await mysql.createConnection(config);
      const adminID = jwt.verify(token, 'tu_secreto_jwt').id;
      const [rows] = await connection.execute('SELECT * FROM membership_durations WHERE admin_id = ?', [adminID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async create(membershipDuration, token) {
    try {
      const connection = await mysql.createConnection(config);
      const adminID = jwt.verify(token, 'tu_secreto_jwt').id;
      const [result] = await connection.execute('INSERT INTO membership_durations (membership_id, duration, price, admin_id) VALUES (?, ?, ?, ?)', [membershipDuration.membership_id, membershipDuration.duration, membershipDuration.price, adminID]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async delete(token, id) {
    try {
      const connection = await mysql.createConnection(config);
      const adminID = jwt.verify(token, 'tu_secreto_jwt').id;
      const [result] = await connection.execute('DELETE FROM membership_durations WHERE id = ? AND admin_id = ?', [id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async update(token, id, membershipDuration) {
    try {
      const connection = await mysql.createConnection(config);
      const adminID = jwt.verify(token, 'tu_secreto_jwt').id;
      const [result] = await connection.execute('UPDATE membership_durations SET duration = ?, price = ? WHERE id = ? AND admin_id = ?', [membershipDuration.duration, membershipDuration.price, id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = MembershipDuration;