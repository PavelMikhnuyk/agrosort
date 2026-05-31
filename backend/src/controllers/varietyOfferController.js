const { VarietyOffer, Variety, User } = require('../models');

// GET /api/varieties/:varietyId/offers - получить все предложения для сорта
const getByVariety = async (req, res) => {
  try {
    const { varietyId } = req.params;
    const variety = await Variety.findByPk(varietyId);
    if (!variety) return res.status(404).json({ error: 'Сорт не найден' });

    const offers = await VarietyOffer.findAll({
      where: { varietyId, isActive: true },
      order: [['price', 'ASC'], ['sortOrder', 'ASC']],
      include: [
        { model: User, as: 'offerAuthor', attributes: ['id', 'name'] }
      ]
    });

    const offersWithLabels = offers.map(offer => ({
      id: offer.id,
      shopName: offer.shopName,
      price: parseFloat(offer.price),
      unit: offer.unit,
      unitLabel: offer.getUnitLabel(),
      url: offer.url,
      sortOrder: offer.sortOrder,
      createdAt: offer.createdAt
    }));

    res.json({ data: offersWithLabels });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения предложений', detail: err.message });
  }
};

// GET /api/varieties/:varietyId/offers/all - все предложения (включая неактивные) для админки
const getAllByVariety = async (req, res) => {
  try {
    const { varietyId } = req.params;
    const offers = await VarietyOffer.findAll({
      where: { varietyId },
      order: [['price', 'ASC'], ['sortOrder', 'ASC']],
      include: [
        { model: User, as: 'offerAuthor', attributes: ['id', 'name'] }
      ]
    });

    const offersWithLabels = offers.map(offer => ({
      id: offer.id,
      shopName: offer.shopName,
      price: parseFloat(offer.price),
      unit: offer.unit,
      unitLabel: offer.getUnitLabel(),
      url: offer.url,
      isActive: offer.isActive,
      sortOrder: offer.sortOrder,
      createdAt: offer.createdAt,
      author: offer.offerAuthor
    }));

    res.json({ data: offersWithLabels });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения предложений', detail: err.message });
  }
};

// POST /api/varieties/:varietyId/offers - добавить предложение
const create = async (req, res) => {
  try {
    const { varietyId } = req.params;
    const variety = await Variety.findByPk(varietyId);
    if (!variety) return res.status(404).json({ error: 'Сорт не найден' });

    const data = { ...req.body, varietyId, addedBy: req.user.id };
    const offer = await VarietyOffer.create(data);

    const full = await VarietyOffer.findByPk(offer.id, {
      include: [{ model: User, as: 'offerAuthor', attributes: ['id', 'name'] }]
    });

    res.status(201).json({
      data: {
        id: full.id,
        shopName: full.shopName,
        price: parseFloat(full.price),
        unit: full.unit,
        unitLabel: full.getUnitLabel(),
        url: full.url,
        isActive: full.isActive,
        sortOrder: full.sortOrder,
        createdAt: full.createdAt,
        author: full.offerAuthor
      }
    });
  } catch (err) {
    res.status(400).json({ error: 'Ошибка создания предложения', detail: err.message });
  }
};

// PUT /api/offers/:id - обновить предложение
const update = async (req, res) => {
  try {
    const offer = await VarietyOffer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Предложение не найдено' });

    await offer.update(req.body);

    const full = await VarietyOffer.findByPk(offer.id, {
      include: [{ model: User, as: 'offerAuthor', attributes: ['id', 'name'] }]
    });

    res.json({
      data: {
        id: full.id,
        shopName: full.shopName,
        price: parseFloat(full.price),
        unit: full.unit,
        unitLabel: full.getUnitLabel(),
        url: full.url,
        isActive: full.isActive,
        sortOrder: full.sortOrder,
        createdAt: full.createdAt,
        author: full.offerAuthor
      }
    });
  } catch (err) {
    res.status(400).json({ error: 'Ошибка обновления', detail: err.message });
  }
};

// DELETE /api/offers/:id - удалить предложение
const remove = async (req, res) => {
  try {
    const offer = await VarietyOffer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Предложение не найдено' });

    await offer.destroy();
    res.json({ message: 'Предложение удалено' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления', detail: err.message });
  }
};

module.exports = { getByVariety, getAllByVariety, create, update, remove };