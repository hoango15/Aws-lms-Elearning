const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default role is student. First registered user could be admin, but let's stick to student by default.
    // If database is empty, let's make them an admin! This makes it easy for the user to initialize an admin.
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const role = userCount[0].count === 0 ? 'admin' : 'student';

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)',
      [fullname, email, hashedPassword, role]
    );

    // Create JWT Token
    const token = jwt.sign(
      { id: result.insertId, email, role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: result.insertId,
        fullname,
        email,
        role,
        avatar: null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const [users] = await db.query('SELECT id, fullname, email, role, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update profile information
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullname } = req.body;
    let avatarUrl = null;

    if (!fullname) {
      return res.status(400).json({ success: false, message: 'Fullname is required.' });
    }

    let query = 'UPDATE users SET fullname = ?';
    let params = [fullname];

    if (req.file) {
      // Multer file upload
      avatarUrl = `/uploads/${req.file.filename}`;
      query += ', avatar = ?';
      params.push(avatarUrl);
    }

    query += ' WHERE id = ?';
    params.push(req.user.id);

    await db.query(query, params);

    // Get updated user data
    const [updatedUsers] = await db.query('SELECT id, fullname, email, role, avatar FROM users WHERE id = ?', [req.user.id]);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUsers[0]
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide old and new passwords.' });
    }

    // Get user password
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
