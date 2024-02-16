// models/category.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');

class Category {
  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [rows] = await connection.execute('SELECT * FROM categories WHERE admin_id = ?', [userID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async create(category, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [result] = await connection.execute('INSERT INTO categories (name, admin_id) VALUES (?, ?)', [category.name, userID]);
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
      const [result] = await connection.execute('DELETE FROM categories WHERE id = ? AND admin_id = ?', [id, userID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async update(id, category, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [result] = await connection.execute('UPDATE categories SET name = ? WHERE id = ? AND admin_id = ?', [category.name, id, userID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Category;