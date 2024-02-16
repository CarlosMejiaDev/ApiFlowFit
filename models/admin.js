// models/admin.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig'); // Importa la configuración de la base de datos

class Admin {
  static async findByUsername(username) {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT * FROM admins WHERE username = ?', [username]);
      return rows[0]; // Asegúrate de que esto incluye la propiedad 'id'
    } catch (err) {
      throw err;
    }
  }

  static async register(username, first_name, last_name, email, password, birth_date) {
    try {
      const connection = await mysql.createConnection(config);
      const [result] = await connection.execute(
        'INSERT INTO admins (username, first_name, last_name, email, password, birth_date) VALUES (?, ?, ?, ?, ?, ?)',
        [username, first_name, last_name, email, password, birth_date]
      );
      return result.insertId;
    } catch (err) {
      throw err;
    }
  }

  static async generateAuthToken(admin) {
    const token = jwt.sign({ id: admin.id }, 'tu_secreto_jwt', { expiresIn: '1h' });
    return token;
  }
}

module.exports = Admin;