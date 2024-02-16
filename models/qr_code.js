// models/qr_code.js
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

class QrCode {
  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
      const [rows] = await connection.execute('SELECT * FROM qr_codes WHERE admin_id = ?', [adminID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async create(qrCode, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
  
      // Check if qrCode.qr_code_path and qrCode.qr_code_path.name are defined
      if (!qrCode.qr_code_path || !qrCode.qr_code_path.name) {
        throw new Error('qrCode.qr_code_path is undefined or does not have a name');
      }
  
      // Sube la imagen al Firebase Storage
      const file = bucket.file(`qr_codes/${qrCode.qr_code_path.name}`);
      await file.save(qrCode.qr_code_path.data);
  
      // Guarda la URL de la imagen en la base de datos
      qrCode.qr_code_path = `https://firebasestorage.googleapis.com/v0/b/flowfitimagenes.appspot.com/o/${encodeURIComponent(file.name)}?alt=media`;
  
      const [result] = await connection.execute('INSERT INTO qr_codes (qr_code_path, admin_id) VALUES (?, ?)', [qrCode.qr_code_path, adminID]);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = QrCode;