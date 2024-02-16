// models/MembershipSale.js

const mysql = require('mysql2/promise');
const config = require('../dbconfig');

class MembershipSale {
  static async create(sale, adminID) {
    try {
      const connection = await mysql.createConnection(config);
      const [result] = await connection.execute('INSERT INTO membership_sales_history (membership_id, sale_date, admin_id, member_id, price) VALUES (?, ?, ?, ?, ?)', [sale.membership_id, new Date(), adminID, sale.member_id, sale.price]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async getAll(adminID) {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT * FROM membership_sales_history WHERE admin_id = ?', [adminID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = MembershipSale;