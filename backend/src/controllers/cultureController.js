const { Culture, Variety } = require('../models');
const { sequelize } = require('../models');

const getAll = async (req, res) => {
  try {
    const cultures = await Culture.findAll({
      attributes: {
        include: [[sequelize.fn('COUNT', sequelize.col('varieties.id')), 'varietyCount']]
      },
      include: [{ model: Variety, as: 'varieties', attributes: [] }],
      group: ['Culture.id'],
      order: [['name', 'ASC']]
    });
    res.json({ data: cultures });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения культур', detail: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const culture = await Culture.findByPk(req.params.id);
    if (!culture) return res.status(404).json({ error: 'Культура не найдена' });
    res.json({ data: culture });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const culture = await Culture.create(req.body);
    res.status(201).json({ data: culture });
  } catch (err) {
    res.status(400).json({ error: 'Ошибка создания культуры', detail: err.message });
  }
};

const update = async (req, res) => {
  try {
    const culture = await Culture.findByPk(req.params.id);
    if (!culture) return res.status(404).json({ error: 'Культура не найдена' });
    await culture.update(req.body);
    res.json({ data: culture });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const culture = await Culture.findByPk(req.params.id);
    if (!culture) return res.status(404).json({ error: 'Культура не найдена' });
    const count = await Variety.count({ where: { cultureId: req.params.id } });
    if (count > 0) return res.status(409).json({ error: `Нельзя удалить: есть ${count} сортов` });
    await culture.destroy();
    res.json({ message: 'Культура удалена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
