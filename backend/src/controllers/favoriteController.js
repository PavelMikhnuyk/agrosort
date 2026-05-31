const { Favorite, Variety, Culture } = require('../models');

const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Variety, as: 'variety',
        include: [{ model: Culture, as: 'culture', attributes: ['name', 'category', 'icon'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ data: favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggle = async (req, res) => {
  try {
    const { varietyId } = req.params;
    const variety = await Variety.findByPk(varietyId);
    if (!variety) return res.status(404).json({ error: 'Сорт не найден' });

    const existing = await Favorite.findOne({ where: { userId: req.user.id, varietyId } });
    if (existing) {
      await existing.destroy();
      res.json({ favorited: false, message: 'Удалено из избранного' });
    } else {
      const { note } = req.body;
      await Favorite.create({ userId: req.user.id, varietyId, note });
      res.status(201).json({ favorited: true, message: 'Добавлено в избранное' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMyFavorites, toggle };
