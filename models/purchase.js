// models/purchase.js

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')('sk_test_51OounUGf0J9y3KivqLaSCWTvL6lRjYEHVGuLlHI4w3LTM3tZibUdnpg2e78M25e5t3ZgBuJ0rzA4qSraPCM2XGkR00oJ0ziAp0');
const config = require('../dbconfig');

class Purchase {
  static async getAll(token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [rows] = await connection.execute('SELECT * FROM purchases WHERE admin_id = ?', [userID]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async create(purchase, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [result] = await connection.execute('INSERT INTO purchases (member_id, product_id, quantity, purchase_date, admin_id) VALUES (?, ?, ?, ?, ?)', [purchase.member_id, purchase.product_id, purchase.quantity, purchase.purchase_date, userID]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async delete(id, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [result] = await connection.execute('DELETE FROM purchases WHERE id = ? AND admin_id = ?', [id, userID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async update(id, purchase, token) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const userID = decoded.id;
      const [result] = await connection.execute('UPDATE purchases SET member_id = ?, product_id = ?, quantity = ?, purchase_date = ? WHERE id = ? AND admin_id = ?', [purchase.member_id, purchase.product_id, purchase.quantity, purchase.purchase_date, id, userID]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }

  static async createByMember(purchase, token, stripeToken) {
    try {
      const connection = await mysql.createConnection(config);
      const decoded = jwt.verify(token, 'tu_secreto_jwt');
      const memberID = decoded.id;

      // Get the admin_id for the member
      const [memberRows] = await connection.execute('SELECT admin_id FROM members WHERE id = ?', [memberID]);
      const adminID = memberRows[0].admin_id;

      // Get the product price
      const [productRows] = await connection.execute('SELECT price FROM products WHERE id = ?', [purchase.product_id]);
      const productPrice = productRows[0].price;

      // Calculate the total price
      const totalPrice = productPrice * purchase.quantity;

      // Create a new charge using Stripe
      const charge = await stripe.charges.create({
        amount: totalPrice * 100, // Stripe requires the amount to be in cents
        currency: 'MXN',
        source: stripeToken,
        description: `Purchase of ${purchase.quantity} product(s) with ID ${purchase.product_id}`
      });

      if (charge.status !== 'succeeded') {
        throw new Error('The payment failed');
      }

      // Start a transaction
      await connection.beginTransaction();

      // Insert the purchase
      const [result] = await connection.execute('INSERT INTO purchases (member_id, product_id, quantity, purchase_date, admin_id) VALUES (?, ?, ?, ?, ?)', [memberID, purchase.product_id, purchase.quantity, purchase.purchase_date, adminID]);

      // Update the product quantity
      await connection.execute('UPDATE products SET quantity = quantity - ? WHERE id = ?', [purchase.quantity, purchase.product_id]);

      // Commit the transaction
      await connection.commit();

      return result;
    } catch (err) {
      // If there is an error, rollback the transaction
      await connection.rollback();
      throw err;
    }
  }
}

module.exports = Purchase;