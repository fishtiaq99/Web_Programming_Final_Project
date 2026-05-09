const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Check cookie first, then Authorization header
  const token = req.cookies?.token ||
    (req.headers['authorization']?.startsWith('Bearer ')
      ? req.headers['authorization'].split(' ')[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  if (req.user.role !== 'user') return res.status(403).json({ error: 'Users only.' });
  next();
}

module.exports = { authenticateToken, requireAdmin, requireUser };