require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const { corsOptions } = require('./config/cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for correct IP detection behind load balancers
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(frontendPath, 'uploads')));

app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ База данных подключена');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Таблицы синхронизированы');
    app.listen(PORT, () => {
      console.log(`🚀 AgroSort запущен на http://localhost:${PORT}`);
      console.log(`📋 API: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Ошибка запуска:', err);
    process.exit(1);
  }
};

start();
