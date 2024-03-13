// models/membership.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');

class Membership {
  static async getOneMonthMemberships(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [rows] = await connection.execute('SELECT * FROM memberships WHERE admin_id = ? AND duration = 1', [userID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }
  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [rows] = await connection.execute('SELECT * FROM memberships WHERE admin_id = ?', [userID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }
  static async getMembershipsByTitle(token, title) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [rows] = await connection.execute('SELECT * FROM memberships WHERE admin_id = ? AND title = ?', [userID, title]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async create(membership, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [result] = await connection.execute('INSERT INTO memberships (title, description, duration, price, admin_id) VALUES (?, ?, ?, ?, ?)', [membership.title, membership.description, membership.duration, membership.price, userID]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async delete(id, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [result] = await connection.execute('DELETE FROM memberships WHERE id = ? AND admin_id = ?', [id, userID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async update(id, membership, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [result] = await connection.execute('UPDATE memberships SET title = ?, description = ?, duration = ?, price = ? WHERE id = ? AND admin_id = ?', [membership.title, membership.description, membership.duration, membership.price, id, userID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Membership;