// models/member_entry.js
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');

class MemberEntry {
  static async getMemberData(token) {
    try {
      const connection = await mysql.createConnection(config);
      const actualToken = token.replace('Bearer ', ''); // Eliminar el prefijo 'Bearer ' si está presente
      console.log('Token:', actualToken); // Agregar registro de consola para el token
      const decoded = jwt.verify(actualToken, 'tu_secreto_jwt');
      console.log('Decoded:', decoded); // Agregar registro de consola para el objeto decodificado
  
      if (!decoded || decoded.role !== 'member') {
        throw new Error('Invalid token or not a member');
      }
  
      const query = 'SELECT * FROM member_entries WHERE member_id = ?';
      const [rows] = await connection.execute(query, [decoded.id]);
      return rows;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async getAllData(token) {
    try {
      const connection = await mysql.createConnection(config);
      const actualToken = token.replace('Bearer ', ''); // Eliminar el prefijo 'Bearer ' si está presente
      const decoded = jwt.verify(actualToken, 'tu_secreto_jwt');

      if (!decoded || decoded.role !== 'admin') {
        throw new Error('Invalid token or not an admin');
      }

      const query = 'SELECT * FROM member_entries';
      const [rows] = await connection.execute(query);
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