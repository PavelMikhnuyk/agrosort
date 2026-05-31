const { User } = require('../models');

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, blocked } = req.query;

    const where = {};
    if (role) where.role = role;
    if (blocked === 'true') where.isActive = false;
    else if (blocked === 'false') where.isActive = true;

    if (search) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { organization: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 100),
      offset
    });

    res.json({
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения пользователей', detail: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const { role } = req.body;
    if (!['viewer', 'agronomist', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }

    await user.update({ role });
    res.json({ data: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления роли', detail: err.message });
  }
};

const toggleBlock = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Нельзя заблокировать себя' });
    }

    const newStatus = !user.isActive;
    await user.update({ isActive: newStatus });
    res.json({ data: { id: user.id, email: user.email, name: user.name, isActive: user.isActive } });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка блокировки', detail: err.message });
  }
};

module.exports = { getAll, getOne, updateRole, toggleBlock };