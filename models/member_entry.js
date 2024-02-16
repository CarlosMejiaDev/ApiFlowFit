// models/member_entry.js
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');

class MemberEntry {
  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const memberID = decoded.memberID;
      console.log(decoded);
      const [rows] = await connection.execute('SELECT * FROM member_entries WHERE member_id = ?', [memberID]);
      return rows;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  static async create(memberEntry, token) {
    try {
      if (!memberEntry) {
        throw new Error('memberEntry does not exist');
      }
  
      const connection = await mysql.createConnection(config);
      console.log(token);
  
      // Remove the "Bearer " prefix
      const actualToken = token.replace('Bearer ', '');
  
      const decoded = jwt.verify(actualToken, 'tu_secreto_jwt');
      console.log(decoded);
  
      if (!decoded) {
        throw new Error('Invalid token');
      }
  
      const memberID = decoded.id;
      const [result] = await connection.execute('INSERT INTO member_entries (member_id) VALUES (?)', [memberID]);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
module.exports = MemberEntry;