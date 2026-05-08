const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, [
  body('message').trim().isLength({ min: 10, max: 1000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await pool.query(
      'INSERT INTO inquiry (userid, message) VALUES ($1, $2)',
      [req.user.id, req.body.message]
    );
    res.json({ message: 'Inquiry submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.inquiryid, i.message, i.submitdate, i.statusflag,
             a.adminresponse, a.responsedate
      FROM inquiry i
      LEFT JOIN answers a ON i.inquiryid = a.inquiryid
      WHERE i.userid=$1 ORDER BY i.submitdate DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;