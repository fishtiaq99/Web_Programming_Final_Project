const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// DELETE COMMENT
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const check = await pool.query(
      'SELECT userid FROM comments WHERE commentid=$1', [req.params.id]
    );
    if (!check.rows.length) return res.status(404).json({ error: 'Not found' });
    if (check.rows[0].userid !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });
    await pool.query('DELETE FROM comments WHERE commentid=$1', [req.params.id]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// REPORT COMMENT
router.post('/:id/report', authenticateToken, [
  body('reason').trim().isLength({ min: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await pool.query(
      `INSERT INTO reports (reporteruserid, commentid, reason) VALUES ($1, $2, $3)`,
      [req.user.id, req.params.id, req.body.reason]
    );
    res.json({ message: 'Comment reported' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;