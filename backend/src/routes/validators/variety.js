const { body, param, query } = require('express-validator');

const create = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Название должно быть 1-200 символов')
    .notEmpty().withMessage('Название обязательно'),
  body('cultureId')
    .isInt({ min: 1 }).withMessage('Некорректный ID культуры'),
  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Номер регистрации слишком длинный'),
  body('yearRegistered')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Некорректный год регистрации'),
  body('yearExcluded')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Некорректный год исключения'),
  body('status')
    .optional()
    .isIn(['active', 'excluded', 'pending'])
    .withMessage('Некорректный статус'),
  body('breeder')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Селекционер слишком длинный'),
  body('originCountry')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Страна происхождения слишком длинная'),
  body('yieldMin')
    .optional()
    .isFloat({ min: 0 }).withMessage('Урожайность должна быть положительной'),
  body('yieldMax')
    .optional()
    .isFloat({ min: 0 }).withMessage('Урожайность должна быть положительной'),
  body('vegetationDays')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Некорректное количество дней вегетации'),
  body('frostResistance')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Морозостойкость должна быть 1-5'),
  body('droughtResistance')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Засухоустойчивость должна быть 1-5'),
  body('diseaseResistance')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Устойчивость к болезням должна быть 1-5'),
  body('admittedRegions')
    .optional()
    .isArray().withMessage('Регионы должны быть массивом'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 10000 }).withMessage('Описание слишком длинное')
];

const update = [
  param('id')
    .isInt({ min: 1 }).withMessage('Некорректный ID'),
  ...create
];

const getAll = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Некорректный номер страницы'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Некорректный лимит'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Слишком длинный поисковый запрос'),
  query('cultureId')
    .optional()
    .isInt({ min: 1 }).withMessage('Некорректный ID культуры'),
  query('status')
    .optional()
    .isIn(['active', 'excluded', 'pending']).withMessage('Некорректный статус'),
  query('yearFrom')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Некорректный год'),
  query('yearTo')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Некорректный год'),
  query('sortBy')
    .optional()
    .isIn(['name', 'yearRegistered', 'createdAt', 'viewCount']).withMessage('Некорректное поле сортировки'),
  query('sortDir')
    .optional()
    .isIn(['ASC', 'DESC']).withMessage('Некорректное направление сортировки')
];

const getOne = [
  param('id')
    .isInt({ min: 1 }).withMessage('Некорректный ID')
];

const remove = [
  param('id')
    .isInt({ min: 1 }).withMessage('Некорректный ID')
];

module.exports = { create, update, getAll, getOne, remove };