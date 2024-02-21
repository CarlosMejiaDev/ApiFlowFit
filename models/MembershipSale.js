// models/MembershipSale.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');

class MembershipSale {
  static async create(sale, token) {
    try {
      const connection = await mysql.createConnection(config);
      const adminID = jwt.verify(token, 'tu_secreto_jwt').id;
      const [result] = await connection.execute('INSERT INTO membership_sales_history (membership_id, sale_date, admin_id, member_id, price) VALUES (?, ?, ?, ?, ?)', [sale.membership_id, new Date(), adminID, sale.member_id, sale.price]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
      const [rows] = await connection.execute('SELECT * FROM membership_sales_history WHERE admin_id = ?', [adminID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = MembershipSale;