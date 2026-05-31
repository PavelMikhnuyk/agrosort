const router = require('express').Router();
const auth = require('../controllers/authController');
const variety = require('../controllers/varietyController');
const culture = require('../controllers/cultureController');
const favorite = require('../controllers/favoriteController');
const varietyOffer = require('../controllers/varietyOfferController');
const users = require('../controllers/userController');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const authValidators = require('./validators/auth');
const varietyValidators = require('./validators/variety');

// Auth
router.post('/auth/register', authLimiter, authValidators.register, validate, auth.register);
router.post('/auth/login', authLimiter, authValidators.login, validate, auth.login);
router.get('/auth/me', authenticate, auth.me);
router.put('/auth/profile', authenticate, authValidators.updateProfile, validate, auth.updateProfile);

// Users (admin only)
router.get('/users', authenticate, requireRole('admin'), users.getAll);
router.get('/users/:id', authenticate, requireRole('admin'), users.getOne);
router.put('/users/:id/role', authenticate, requireRole('admin'), users.updateRole);
router.put('/users/:id/block', authenticate, requireRole('admin'), users.toggleBlock);

// Cultures (public read, admin write)
router.get('/cultures', culture.getAll);
router.get('/cultures/:id', culture.getOne);
router.post('/cultures', authenticate, requireRole('admin'), culture.create);
router.put('/cultures/:id', authenticate, requireRole('admin'), culture.update);
router.delete('/cultures/:id', authenticate, requireRole('admin'), culture.remove);

// Favorites (auth only)
router.get('/favorites', authenticate, favorite.getMyFavorites);
router.post('/favorites/:varietyId', authenticate, favorite.toggle);
router.delete('/favorites/:varietyId', authenticate, favorite.toggle);

// Varieties — статические маршруты ПЕРВЫМИ
router.get('/varieties/stats', variety.getStats);
router.get('/varieties/export/excel', variety.exportExcel);
router.get('/varieties/export/pdf', variety.exportPdf);

// Variety Offers — ПОСЛЕ статических, НО ДО /:id
router.get('/varieties/:varietyId/offers', varietyOffer.getByVariety);
router.get('/varieties/:varietyId/offers/all', authenticate, requireRole('admin', 'agronomist'), varietyOffer.getAllByVariety);
router.post('/varieties/:varietyId/offers', authenticate, requireRole('admin', 'agronomist'), varietyOffer.create);
router.put('/offers/:id', authenticate, requireRole('admin', 'agronomist'), varietyOffer.update);
router.delete('/offers/:id', authenticate, requireRole('admin', 'agronomist'), varietyOffer.remove);

// Varieties — динамические маршруты ПОСЛЕДНИМИ
router.get('/varieties', optionalAuth, varietyValidators.getAll, validate, variety.getAll);
router.get('/varieties/:id', optionalAuth, varietyValidators.getOne, validate, variety.getOne);
router.post('/varieties', authenticate, requireRole('admin', 'agronomist'), varietyValidators.create, validate, variety.create);
router.put('/varieties/:id', authenticate, requireRole('admin', 'agronomist'), varietyValidators.update, validate, variety.update);
router.delete('/varieties/:id', authenticate, requireRole('admin', 'agronomist'), varietyValidators.remove, validate, variety.remove);
router.post('/varieties/:id/image', authenticate, requireRole('admin', 'agronomist'), variety.uploadImage);
router.get('/varieties/:id/history', variety.getHistory);

module.exports = router;