const { body, param } = require('express-validator');

const register = [
  body('email')
    .isEmail().withMessage('Некорректный email')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email слишком длинный'),
  body('password')
    .isLength({ min: 8, max: 100 }).withMessage('Пароль должен быть 8-100 символов')
    .matches(/[A-Za-z]/).withMessage('Пароль должен содержать латинские буквы')
    .matches(/[0-9]/).withMessage('Пароль должен содержать цифры'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Имя должно быть 2-150 символов')
    .notEmpty().withMessage('Имя обязательно'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Организация слишком длинная'),
  body('region')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Регион слишком длинный')
];

const login = [
  body('email')
    .isEmail().withMessage('Некорректный email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Пароль обязателен')
    .isLength({ max: 100 }).withMessage('Пароль слишком длинный')
];

const updateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Имя должно быть 2-150 символов'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Организация слишком длинная'),
  body('region')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Регион слишком длинный')
];

module.exports = { register, login, updateProfile };