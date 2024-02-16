// models/provider.js

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

class Provider {
  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
      const [rows] = await connection.execute('SELECT * FROM providers WHERE admin_id = ?', [adminID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async create(provider, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
  
      // Sube la imagen al Firebase Storage
      const file = bucket.file(`provider_images/${provider.image_path.name}`);
      await file.save(provider.image_path.data);
  
      // Guarda la URL de la imagen en la base de datos
      provider.image_path = `https://firebasestorage.googleapis.com/v0/b/flowfitimagenes.appspot.com/o/${encodeURIComponent(file.name)}?alt=media`;
  
      const [result] = await connection.execute('INSERT INTO providers (name, email, phone, address, admin_id, image_path) VALUES (?, ?, ?, ?, ?, ?)', [provider.name, provider.email, provider.phone, provider.address, adminID, provider.image_path]);
      return result;
    } catch (err) {
      throw err;
    }
  }
  

  static async delete(id, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
      const [result] = await connection.execute('DELETE FROM providers WHERE id = ? AND admin_id = ?', [id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async update(id, provider, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;

      // Sube la imagen al Firebase Storage
      const file = bucket.file(`provider_images/${provider.image_path.name}`);
      await file.save(provider.image_path.data);

      // Guarda la URL de la imagen en la base de datos
      provider.image_path = `https://firebasestorage.googleapis.com/v0/b/flowfitimagenes.appspot.com/o/${encodeURIComponent(file.name)}?alt=media`;

      const [result] = await connection.execute('UPDATE providers SET name = ?, email = ?, phone = ?, address = ?, image_path = ? WHERE id = ? AND admin_id = ?', [provider.name, provider.email, provider.phone, provider.address, provider.image_path, id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Provider;