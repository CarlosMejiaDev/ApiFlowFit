// models/product.js

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

class Product {
  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
      const [rows] = await connection.execute('SELECT * FROM products WHERE admin_id = ?', [adminID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async create(product, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
  
      // Check if product.image_path and product.image_path.name are defined
      if (!product.image_path || !product.image_path.name) {
        throw new Error('product.image_path is undefined or does not have a name');
      }
  
      // Sube la imagen al Firebase Storage
      const file = bucket.file(`product_images/${product.image_path.name}`);
      await file.save(product.image_path.data);
  
      // Guarda la URL de la imagen en la base de datos
      product.image_path = `https://firebasestorage.googleapis.com/v0/b/flowfitimagenes.appspot.com/o/${encodeURIComponent(file.name)}?alt=media`;
  
      const [result] = await connection.execute('INSERT INTO products (name, description, price, quantity, category_id, provider_id, admin_id, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [product.name, product.description, product.price, product.quantity, product.category_id, product.provider_id, adminID, product.image_path]);
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
      const [result] = await connection.execute('DELETE FROM products WHERE id = ? AND admin_id = ?', [id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async update(id, product, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
  
      // Sube la imagen al Firebase Storage
      const file = bucket.file(`product_images/${product.image_path.name}`);
      await file.save(product.image_path.data);
  
      // Guarda la URL de la imagen en la base de datos
      product.image_path = `https://firebasestorage.googleapis.com/v0/b/flowfitimagenes.appspot.com/o/${encodeURIComponent(file.name)}?alt=media`;
  
      const [result] = await connection.execute('UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, category_id = ?, provider_id = ?, image_path = ? WHERE id = ? AND admin_id = ?', [product.name, product.description, product.price, product.quantity, product.category_id, product.provider_id, product.image_path, id, adminID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async decreaseQuantity(id, quantity, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const adminID = decoded.id;
      const [result] = await connection.execute('UPDATE products SET quantity = quantity - ? WHERE id = ? AND admin_id = ?', [quantity, id, adminID]);
      return result.affectedRows[0];
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Product;