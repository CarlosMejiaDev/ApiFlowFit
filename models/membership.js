// models/membership.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');

class Membership {
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

  static async create(membership, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [result] = await connection.execute('INSERT INTO memberships (title, description, price, admin_id) VALUES (?, ?, ?, ?)', [membership.title, membership.description, membership.price, userID]);
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
      const [result] = await connection.execute('UPDATE memberships SET title = ?, description = ?, price = ? WHERE id = ? AND admin_id = ?', [membership.title, membership.description, membership.price, id, userID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Membership;