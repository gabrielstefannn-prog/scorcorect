const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username și parola sunt obligatorii' });
  if (password.length < 6) return res.status(400).json({ error: 'Parola trebuie să aibă minim 6 caractere' });

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Username-ul este deja folosit' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashed } });
    res.json({ token: generateToken(user), user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
  } catch (e) {
    res.status(500).json({ error: 'Eroare la înregistrare' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Username sau parolă incorectă' });

    res.json({ token: generateToken(user), user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
  } catch (e) {
    res.status(500).json({ error: 'Eroare la autentificare' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, username: true, isAdmin: true } });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Eroare server' });
  }
};
