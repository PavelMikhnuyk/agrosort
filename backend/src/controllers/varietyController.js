const { Op } = require('sequelize');
const { Variety, Culture, User, Favorite, VarietyHistory, sequelize } = require('../models');
const XLSX = require('xlsx');
const PdfPrinter = require('pdfmake/src/printer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize pdfmake with fonts
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../../node_modules/pdfmake/fonts/Roboto/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../../node_modules/pdfmake/fonts/Roboto/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../../node_modules/pdfmake/fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../../n  ode_modules/pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf')
  }
};
const printer = new PdfPrinter(fonts);

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
  try {
    const varieties = await Variety.findAll({
      include: [
        { model: Culture, as: 'culture', attributes: ['name', 'category'] },
        { model: User, as: 'author', attributes: ['name'] }
      ],
      order: [['name', 'ASC']]
    });

    const tableBody = [
      [
        { text: 'Название', style: 'tableHeader' },
        { text: 'Культура', style: 'tableHeader' },
        { text: 'Статус', style: 'tableHeader' },
        { text: 'Год', style: 'tableHeader' },
        { text: 'Оригинатор', style: 'tableHeader' }
      ]
    ];

    varieties.forEach(v => {
      tableBody.push([
        v.name || '',
        v.culture?.name || '',
        v.status === 'active' ? 'Допущен' : v.status === 'excluded' ? 'Исключён' : 'На рассмотрении',
        v.yearRegistered || '',
        v.breeder || ''
      ]);
    });

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [20, 40, 20, 40],
      header: {
        text: 'Каталог сортов сельскохозяйственных культур',
        style: 'header',
        margin: [20, 10, 20, 10]
      },
      content: [
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto', 'auto', '*'],
            body: tableBody
          },
          layout: {
            fillColor: (rowIndex) => rowIndex === 0 ? '#CCCCCC' : null,
            hLineWidth: () => 1,
            vLineWidth: () => 1
          }
        }
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center' },
        tableHeader: { bold: true, fillColor: '#EEEEEE' }
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];

    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=agrosort_varieties.pdf');
      res.send(result);
    });
    pdfDoc.end();
  } catch (err) {
    res.status(500).json({ error: 'Ошибка экспорта PDF', detail: err.message });
  }
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
