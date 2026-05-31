const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET, JWT_EXPIRES } = require('../config/auth');

const FAKE_HASH = '$2a$12$dummyhashfortimingattackwhichisverylongand useless123456789';

const register = async (req, res) => {
  try {
    const { email, password, name, organization, region } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, пароль и имя обязательны' });
    }
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email уже зарегистрирован' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hash, name, organization, region });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, organization: user.organization }
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка регистрации', detail: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });

    const user = await User.findOne({ where: { email } });

    // Защита от тайминг-атак: всегда выполняем bcrypt.compare
    const hashToCompare = user?.password || FAKE_HASH;
    await bcrypt.compare(password, hashToCompare);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Неверный email или пароль' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, organization: user.organization, region: user.region }
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка входа', detail: err.message });
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, organization, region } = req.body;
    await req.user.update({ name, organization, region });
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
};

module.exports = { register, login, me, updateProfile };
