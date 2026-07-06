export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('❌', err.message);

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', details });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `That ${field} is already in use` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier' });
  }

  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}

/** Wrap async controllers so thrown errors reach the error handler. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
