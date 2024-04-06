// models/member.js
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const config = require('../dbconfig');
const admin = require('firebase-admin');
const MembershipSale = require('./MembershipSale');

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
      const token = jwt.sign({ id: member.id, role: 'member' }, 'tu_secreto_jwt', { expiresIn: '1h' });  
      return { member, token };
    } catch (err) {
      throw err;
    }
}
static async create(member, token) {
  try {
    const connection = await mysql.createConnection(config);

    // Check if a member with the same email already exists
    const [existingMember] = await connection.execute('SELECT * FROM members WHERE email = ?', [member.email]);
    if (existingMember.length > 0) {
      throw new Error('A member with this email already exists');
    }

    // Generate a random username and password
    member.username = Math.random().toString(36).substring(2, 15);
    member.password = Math.random().toString(36).substring(2, 15);

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

    // Get the membership duration from the memberships table
    const [membership] = await connection.execute('SELECT duration FROM memberships WHERE id = ?', [member.assigned_membership]);
    const membershipDuration = membership[0].duration;

    // Calculate the end date based on the membership duration
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + membershipDuration);

    const [result] = await connection.execute('INSERT INTO members (username, password, level, height, weight, muscle_mass, body_fat_percentage, name, email, phone, assigned_membership, registration_date, end_date, profile_picture, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [member.username, member.password, member.level, member.height, member.weight, member.muscle_mass, member.body_fat_percentage, member.name, member.email, member.phone, member.assigned_membership, new Date(), endDate, member.profile_picture, adminID]);

    // Create a new membership sale
    const sale = {
      membership_id: member.assigned_membership,
      member_id: result.insertId
    };
    await MembershipSale.create(sale, token);

    // Send an email to the member with their username and password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mejiacarlos3210@gmail.com',
        pass: 'wofyvghdicvonszn'
      }
    });

    const mailOptions = {
      from: 'mejiacarlos3210@gmail.com',
      to: member.email,
      subject: `Gracias por usar flowfit, ${member.name}!`,
      text: `Tu nombre de usuario es ${member.username} y tu contraseña es ${member.password}.`
    };

    await transporter.sendMail(mailOptions);

    return result;
  } catch (err) {
    throw err;
  }
}
static async reinscripcion(memberId, membershipId, isStripe, stripeToken, token) {
  try {
    const connection = await mysql.createConnection(config);

    // Get the membership duration and price
    const [membership] = await connection.execute('SELECT duration, price FROM memberships WHERE id = ?', [membershipId]);
    if (!membership[0]) {
      throw new Error(`Membership with id ${membershipId} not found.`);
    }
    const membershipDuration = membership[0].duration;

    // Get the current end date
    const [member] = await connection.execute('SELECT end_date FROM members WHERE id = ?', [memberId]);
    if (!member[0]) {
      throw new Error(`Member with id ${memberId} not found.`);
    }
    let endDate = new Date(member[0].end_date);

    // If the end date is before the current date, set it to the current date
    if (endDate < new Date()) {
      endDate = new Date();
    }

    // Add the membership duration to the end date
    endDate.setMonth(endDate.getMonth() + membershipDuration);

    // Update the end date and membership id in the database
    await connection.execute('UPDATE members SET end_date = ?, assigned_membership = ? WHERE id = ?', [endDate, membershipId, memberId]);
    // If using Stripe, validate the payment
    if (isStripe) {
      const stripe = require('stripe')('sk_test_51OounUGf0J9y3KivqLaSCWTvL6lRjYEHVGuLlHI4w3LTM3tZibUdnpg2e78M25e5t3ZgBuJ0rzA4qSraPCM2XGkR00oJ0ziAp0');
      await stripe.charges.create({
        amount: membership[0].price * 100, // Stripe requires the amount in cents
        currency: 'MXN',
        source: stripeToken,
        description: `Membership renewal for member ${memberId}`
      });
    }

    // Create a new membership sale
    const sale = {
      membership_id: membershipId,
      member_id: memberId
    };
    await MembershipSale.create(sale, token);

    return { success: true };
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
  static async getActiveMembers() {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT * FROM members WHERE is_active = 1');
      return rows;
    } catch (err) {
      throw err;
    }
}

static async getInactiveMembers() {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT * FROM members WHERE is_active = 0');
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
      const memberID = decoded.id;
  
      // Verifica si hay una nueva imagen proporcionada
      if (member.profile_picture && member.profile_picture.name && member.profile_picture.data) {
        // Sube la nueva imagen al Firebase Storage
        const file = bucket.file(`profile_pictures/${member.profile_picture.name}`);
        await file.save(member.profile_picture.data);
  
        // Actualiza la URL de la imagen en la base de datos
        member.profile_picture = `https://firebasestorage.googleapis.com/v0/b/flowfitimagenes.appspot.com/o/${encodeURIComponent(file.name)}?alt=media`;
      }
  
      // Construye dinámicamente la consulta SQL
      const fields = Object.keys(member).filter(key => member[key] !== undefined);
      const placeholders = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => member[field]);
      values.push(id);
  
      // Actualiza la entrada del miembro en la base de datos
      const [result] = await connection.execute(`UPDATE members SET ${placeholders} WHERE id = ? AND id = ?`, [...values, memberID]);
  
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