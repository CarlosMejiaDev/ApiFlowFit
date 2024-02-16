// models/exercise.js

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

class Exercise {
  static async create(exercise, token) {
    try {
      const connection = await mysql.createConnection(config);
  
      // Decode the JWT to get the admin ID
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id; // Changed from 'decoded' to 'decoded.id'
  
      // Check if exercise.image_path and exercise.image_path.name are defined
      if (!exercise.image_path || !exercise.image_path.name) {
        throw new Error('exercise.image_path or exercise.image_path.name is undefined');
      }
  
      // Sube la imagen al Firebase Storage
      const file = bucket.file(`exercise_images/${exercise.image_path.name}`);
      await file.save(exercise.image_path.data);
  
      // Guarda la URL de la imagen en la base de datos
      exercise.image_path = `https://firebasestorage.googleapis.com/v0/b/flowfitimagenes.appspot.com/o/${encodeURIComponent(file.name)}?alt=media`;

      // Check if exercise.gif_reference and exercise.gif_reference.name are defined
      if (!exercise.gif_reference || !exercise.gif_reference.name) {
        throw new Error('exercise.gif_reference or exercise.gif_reference.name is undefined');
      }
  
      // Sube el GIF al Firebase Storage
      const gifFile = bucket.file(`exercise_gifs/${exercise.gif_reference.name}`);
      await gifFile.save(exercise.gif_reference.data);
  
      // Guarda la URL del GIF en la base de datos
      exercise.gif_reference = `https://firebasestorage.googleapis.com/v0/b/flowfitimagenes.appspot.com/o/${encodeURIComponent(gifFile.name)}?alt=media`;
  
      const [result] = await connection.execute('INSERT INTO exercises (name, description, gif_reference, additional_information, image_path, level, area, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [exercise.name, exercise.description, exercise.gif_reference, exercise.additional_information, exercise.image_path, exercise.level, exercise.area, adminID]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id; // Changed from 'decoded' to 'decoded.id'
      const [rows] = await connection.execute('SELECT * FROM exercises WHERE admin_id = ?', [adminID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async getById(id, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id; // Changed from 'decoded' to 'decoded.id'
      const [rows] = await connection.execute('SELECT * FROM exercises WHERE id = ? AND admin_id = ?', [id, adminID]);
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async updateById(id, exercise, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id; // Changed from 'decoded' to 'decoded.id'
      const [result] = await connection.execute('UPDATE exercises SET name = ?, description = ?, gif_reference = ?, additional_information = ?, image_path = ?, level = ?, area = ? WHERE id = ? AND admin_id = ?', [exercise.name, exercise.description, exercise.gif_reference, exercise.additional_information, exercise.image_path, exercise.level, exercise.area, id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async deleteById(id, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id; // Changed from 'decoded' to 'decoded.id'
      const [result] = await connection.execute('DELETE FROM exercises WHERE id = ? AND admin_id = ?', [id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Exercise;