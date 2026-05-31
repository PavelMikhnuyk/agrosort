const { Op } = require('sequelize');
const { Variety, Culture, User, Favorite, VarietyHistory, sequelize } = require('../models');
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../../frontend/uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Только изображения: jpg, png, webp'));
  }
});

// PDF export disabled (pdfmake v0.3 incompatibility)

// GET /api/varieties - список с фильтрами и пагинацией
const getAll = async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      search, cultureId, category, status,
      yearFrom, yearTo, region,
      sortBy = 'name', sortDir = 'ASC'
    } = req.query;

    const where = {};
    const cultureWhere = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { breeder: { [Op.iLike]: `%${search}%` } },
        { registrationNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;
    if (cultureId) where.cultureId = cultureId;
    if (yearFrom) where.yearRegistered = { ...where.yearRegistered, [Op.gte]: parseInt(yearFrom) };
    if (yearTo) where.yearRegistered = { ...where.yearRegistered, [Op.lte]: parseInt(yearTo) };
    if (region) where.admittedRegions = { [Op.contains]: [region] };
    if (category) cultureWhere.category = category;

    const validSortFields = ['name', 'yearRegistered', 'createdAt', 'viewCount'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const orderDir = sortDir === 'DESC' ? 'DESC' : 'ASC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Variety.findAndCountAll({
      where,
      include: [
        { model: Culture, as: 'culture', where: Object.keys(cultureWhere).length ? cultureWhere : undefined, attributes: ['id', 'name', 'category', 'icon'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'organization'] }
      ],
      order: [[orderField, orderDir]],
      limit: Math.min(parseInt(limit), 100),
      offset,
      distinct: true
    });

    res.json({
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения сортов', detail: err.message });
  }
};

// GET /api/varieties/:id
const getOne = async (req, res) => {
  try {
    const variety = await Variety.findByPk(req.params.id, {
      include: [
        { model: Culture, as: 'culture' },
        { model: User, as: 'author', attributes: ['id', 'name', 'organization'] }
      ]
    });
    if (!variety) return res.status(404).json({ error: 'Сорт не найден' });

    await variety.increment('viewCount');

    let isFavorite = false;
    if (req.user) {
      const fav = await Favorite.findOne({ where: { userId: req.user.id, varietyId: variety.id } });
      isFavorite = !!fav;
    }

    res.json({ data: variety, isFavorite });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения сорта', detail: err.message });
  }
};

// POST /api/varieties
const create = async (req, res) => {
  try {
    const data = { ...req.body, addedBy: req.user.id };
    const variety = await Variety.create(data);
    const full = await Variety.findByPk(variety.id, { include: [{ model: Culture, as: 'culture' }] });
    res.status(201).json({ data: full });
  } catch (err) {
    res.status(400).json({ error: 'Ошибка создания сорта', detail: err.message });
  }
};

// PUT /api/varieties/:id
const update = async (req, res) => {
  try {
    const variety = await Variety.findByPk(req.params.id);
    if (!variety) return res.status(404).json({ error: 'Сорт не найден' });
    if (req.user.role !== 'admin' && variety.addedBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав на редактирование' });
    }
    const previousData = variety.toJSON();
    await variety.update(req.body);
    const full = await Variety.findByPk(variety.id, { include: [{ model: Culture, as: 'culture' }] });

    await VarietyHistory.create({
      varietyId: variety.id,
      action: 'update',
      changedBy: req.user.id,
      previousData,
      changes: req.body
    });

    res.json({ data: full });
  } catch (err) {
    res.status(400).json({ error: 'Ошибка обновления', detail: err.message });
  }
};

// DELETE /api/varieties/:id
const remove = async (req, res) => {
  try {
    const variety = await Variety.findByPk(req.params.id);
    if (!variety) return res.status(404).json({ error: 'Сорт не найден' });
    if (req.user.role !== 'admin' && variety.addedBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав на удаление' });
    }
    const previousData = variety.toJSON();
    await variety.destroy();

    await VarietyHistory.create({
      varietyId: variety.id,
      action: 'delete',
      changedBy: req.user.id,
      previousData,
      changes: null
    });

    res.json({ message: 'Сорт удалён' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления', detail: err.message });
  }
};

// GET /api/varieties/stats
const getStats = async (req, res) => {
  try {
    const total = await Variety.count();
    const active = await Variety.count({ where: { status: 'active' } });
    const byCategory = await Variety.findAll({
      include: [{ model: Culture, as: 'culture', attributes: ['category'] }],
      attributes: ['cultureId', [sequelize.fn('COUNT', sequelize.col('Variety.id')), 'count']],
      group: ['cultureId', 'culture.id', 'culture.category'],
      raw: true
    });
    const topViewed = await Variety.findAll({
      order: [['viewCount', 'DESC']],
      limit: 5,
      include: [{ model: Culture, as: 'culture', attributes: ['name', 'icon'] }],
      attributes: ['id', 'name', 'viewCount']
    });
    res.json({ total, active, excluded: total - active, byCategory, topViewed });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка статистики', detail: err.message });
  }
};

// GET /api/varieties/export/excel
const exportExcel = async (req, res) => {
  try {
    const varieties = await Variety.findAll({
      include: [
        { model: Culture, as: 'culture', attributes: ['name', 'category'] },
        { model: User, as: 'author', attributes: ['name'] }
      ],
      order: [['name', 'ASC']]
    });

    const data = varieties.map(v => ({
      'Название': v.name,
      'Регистрационный номер': v.registrationNumber,
      'Культура': v.culture?.name || '',
      'Категория': v.culture?.category || '',
      'Статус': v.status === 'active' ? 'Допущен' : v.status === 'excluded' ? 'Исключён' : 'На рассмотрении',
      'Год регистрации': v.yearRegistered || '',
      'Оригинатор': v.breeder || '',
      'Страна': v.originCountry || '',
      'Урожайность (ц/га)': v.yieldMax ? `${v.yieldMin || 0} - ${v.yieldMax}` : '',
      'Вегетация (дней)': v.vegetationDays || '',
      'Морозостойкость': v.frostResistance || '',
      'Засухоустойчивость': v.droughtResistance || '',
      'Устойчивость к болезням': v.diseaseResistance || '',
      'Регионы допуска': v.admittedRegions?.join(', ') || '',
      'Автор': v.author?.name || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Сорта');
    XLSX.utils.sheet_add_aoa(ws, [[Object.keys(data[0] || {})]], { origin: 'A1' });

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=agrosort_varieties.xlsx');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка экспорта Excel', detail: err.message });
  }
};

// GET /api/varieties/export/pdf
const exportPdf = async (req, res) => {
  res.status(501).json({ error: 'Экспорт в PDF временно недоступен' });
};

// POST /api/varieties/:id/image
const uploadImage = async (req, res) => {
  try {
    const variety = await Variety.findByPk(req.params.id);
    if (!variety) return res.status(404).json({ error: 'Сорт не найден' });

    upload.single('image')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });

      const imagePath = '/uploads/' + req.file.filename;
      await variety.update({ image: imagePath });

      res.json({ data: { image: imagePath } });
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки изображения', detail: err.message });
  }
};

// GET /api/varieties/:id/history
const getHistory = async (req, res) => {
  try {
    const history = await VarietyHistory.findAll({
      where: { varietyId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ data: history });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения истории', detail: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove, getStats, exportExcel, exportPdf, uploadImage, getHistory };
