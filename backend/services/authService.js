const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signup = async ({ email, username, password }) => {
  // Normalize email to lowercase for consistent comparison
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.trim();

  // Check duplicates
  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });
  if (existing) {
    const err = new Error('Email or username already taken');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 12);

  const user = await User.create({
    email: normalizedEmail,
    username: normalizedUsername,
    password_hash,
  });

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    user: { id: user._id.toString(), email: user.email, username: user.username, created_at: user.created_at },
    token,
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const safeUser = { id: user._id.toString(), email: user.email, username: user.username, created_at: user.created_at };
  return { user: safeUser, token };
};

module.exports = { signup, login };
