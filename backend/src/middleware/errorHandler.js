function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === '23505') {
    // Postgres unique violation
    return res.status(409).json({ error: 'A record with these details already exists.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || 'Something went wrong. Please try again.',
  });
}

module.exports = { notFound, errorHandler };
