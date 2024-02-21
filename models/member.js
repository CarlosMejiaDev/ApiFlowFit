// models/member.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');
const admin = require('firebase-admin');

// Configura tus credenciales de Firebase
var serviceAccount = require("../keyStorage.json");

let bucket;
if (admin.apps.length) {
    bucket = admin.storage().bucket();
} else {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "flowfitimagenes.appspot.com"
    });
    bucket = admin.storage().bucket();
}

class Member {
  static async findByUsername(username) {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT * FROM members WHERE username = ?', [username]);
      return rows[0];
    } catch (err) {
      throw err;
    }
  }



  static async login(username, password) {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT * FROM members WHERE username = ?', [username]);
  
      if (rows.length === 0) {
        throw new Error('Invalid username');
      }
  
      const member = rows[0];
  
      // Verifica la contraseña
      if (password !== member.password) {
        throw new Error('Invalid password');
      }
  
      // Genera un token para el miembro
      const token = jwt.sign({ memberID: member.id, role: 'member' }, 'tu_secreto_jwt', { expiresIn: '1h' });  
      return { member, token };
    } catch (err) {
      throw err;
    }
}

static async create(member, token) {
  try {
    const connection = await mysql.createConnection(config);

    // Calculate the end date based on the membership duration
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(member.membership_duration));

    // Decode the JWT to get the user ID
    const decoded = jwt.verify(token, 'tu_secreto_jwt');
    const adminID = decoded.id;

    // Check if member.profile_picture and member.profile_picture.name are defined
    if (!member.profile_picture || !member.profile_picture.name) {
      throw new Error('member.profile_picture or member.profile_picture.name is undefined');
    }

    // Sube la imagen al Firebase Storage
    const file = bucket.file(`profile_pictures/${member.profile_picture.name}`);
    await file.save(member.profile_picture.data);

    // Guarda la URL de la imagen en la base de datos
    member.profile_picture = `https://firebasestorage.googleapis.com/v0/b/flowfitimagenes.appspot.com/o/${encodeURIComponent(file.name)}?alt=media`;

    const [result] = await connection.execute('INSERT INTO members (username, password, level, height, weight, muscle_mass, body_fat_percentage, name, email, phone, assigned_membership, registration_date, end_date, profile_picture, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [member.username, member.password, member.level, member.height, member.weight, member.muscle_mass, member.body_fat_percentage, member.name, member.email, member.phone, member.assigned_membership, new Date(), endDate, member.profile_picture, adminID]);
    return result;
  } catch (err) {
    throw err;
  }
}
  static async getAll() {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT * FROM members');
      return rows;
    } catch (err) {
      throw err;
    }
  }
  static async delete(id, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
      const [result] = await connection.execute('DELETE FROM members WHERE id = ? AND admin_id = ?', [id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async update(id, member, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
      const [result] = await connection.execute('UPDATE members SET username = ?, password = ?, level = ?, height = ?, weight = ?, muscle_mass = ?, body_fat_percentage = ?, name = ?, email = ?, phone = ?, assigned_membership = ?, end_date = ?, profile_picture = ? WHERE id = ? AND admin_id = ?', [member.username, member.password, member.level, member.height, member.weight, member.muscle_mass, member.body_fat_percentage, member.name, member.email, member.phone, member.assigned_membership, member.end_date, member.profile_picture, id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }
  static async getRegisteredToday() {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT * FROM members WHERE DATE(registration_date) = CURDATE()');
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async getTotalMembers() {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT COUNT(*) as total FROM members');
      return rows[0].total;
    } catch (err) {
      throw err;
    }
  }

  static async getExpiringSoon() {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT * FROM members WHERE end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 5 DAY)');
      return rows;
    } catch (err) {
      throw err;
    }
  }
  static async getMembersPerDay() {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT DATE(registration_date) as date, COUNT(*) as count FROM members GROUP BY DATE(registration_date)');
      return rows;
    } catch (err) {
      throw err;
    }
  }
}




module.exports = Member;