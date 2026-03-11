const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const signup = async ({ email, username, password }) => {
  // Check duplicates
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},username.eq.${username}`)
    .limit(1);

  if (existing && existing.length > 0) {
    const err = new Error('Email or username already taken');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ email, username, password_hash })
    .select('id, email, username, created_at')
    .single();

  if (error) throw error;

  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { user, token };
};

const login = async ({ email, password }) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
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
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
};

module.exports = { signup, login };
