const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.error(err.stack);

  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};

module.exports = errorHandler;