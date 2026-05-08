const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken, requireAdmin);

// STATS
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS totalusers,
        (SELECT COUNT(*) FROM posts) AS totalposts,
        (SELECT COUNT(*) FROM reports WHERE statusflag='PENDING') AS pendingreports,
        (SELECT COUNT(*) FROM inquiry WHERE statusflag=0) AS openinquiries,
        (SELECT COUNT(*) FROM users WHERE isactive=false) AS inactiveusers
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ALL USERS
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.userid, u.username, u.email, u.bio, u.joindate, u.isapproved, u.isactive,
        (SELECT COUNT(*) FROM posts WHERE userid=u.userid) AS postcount
      FROM users u ORDER BY u.joindate DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// TOGGLE USER ACTIVE
router.patch('/users/:id/toggle', async (req, res) => {
  try {
    await pool.query(
      'UPDATE users SET isactive = NOT isactive WHERE userid=$1',
      [req.params.id]
    );
    res.json({ message: 'User status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ALL REPORTS
router.get('/reports', async (req, res) => {
  try {
    const { filter } = req.query;
    let query = `
      SELECT r.reportid, r.reason, r.reportdate, r.statusflag,
             r.postid, r.commentid, u.username AS reporterusername
      FROM reports r
      JOIN users u ON r.reporteruserid = u.userid
    `;
    if (filter === 'PENDING') query += ` WHERE r.statusflag = 'PENDING'`;
    else if (filter === 'RESOLVED') query += ` WHERE r.statusflag = 'RESOLVED'`;
    query += ` ORDER BY r.reportdate DESC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// RESOLVE REPORT
router.patch('/reports/:id/resolve', async (req, res) => {
  try {
    const { actionTaken, notes } = req.body;
    await pool.query(
      `UPDATE reports SET statusflag='RESOLVED' WHERE reportid=$1`,
      [req.params.id]
    );
    await pool.query(
      `INSERT INTO reviewreport (adminid, reportid, actiontaken, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (adminid, reportid) DO UPDATE SET actiontaken=$3, notes=$4`,
      [req.user.id, req.params.id, actionTaken || 'NO_ACTION', notes || '']
    );
    res.json({ message: 'Report resolved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET SINGLE POST CONTENT (for report review)
router.get('/content/post/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.postid, p.contenttext, p.creationdate, u.username, u.userid
      FROM posts p
      JOIN users u ON p.userid = u.userid
      WHERE p.postid = $1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET SINGLE COMMENT CONTENT (for report review)
router.get('/content/comment/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.commentid, c.contenttext, c.creationdate, u.username, u.userid
      FROM comments c
      JOIN users u ON c.userid = u.userid
      WHERE c.commentid = $1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Comment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ALL INQUIRIES
router.get('/inquiries', async (req, res) => {
  try {
    const { filter } = req.query;
    let query = `
      SELECT i.inquiryid, i.message, i.submitdate, i.statusflag,
             u.username, u.email
      FROM inquiry i JOIN users u ON i.userid = u.userid
    `;
    if (filter === 'PENDING') query += ` WHERE i.statusflag = 0`;
    else if (filter === 'RESOLVED') query += ` WHERE i.statusflag = 1`;
    query += ` ORDER BY i.submitdate DESC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ANSWER INQUIRY
router.post('/inquiries/:id/answer', async (req, res) => {
  try {
    const { adminResponse } = req.body;
    await pool.query(
      `INSERT INTO answers (adminid, inquiryid, adminresponse) VALUES ($1, $2, $3)
       ON CONFLICT (adminid, inquiryid) DO UPDATE SET adminresponse=$3`,
      [req.user.id, req.params.id, adminResponse]
    );
    await pool.query(
      `UPDATE inquiry SET statusflag=1 WHERE inquiryid=$1`,
      [req.params.id]
    );
    res.json({ message: 'Answered' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE POST (admin)
router.delete('/posts/:id', async (req, res) => {
  try {
    const { reason } = req.body;
    await pool.query(
      `INSERT INTO removepost (adminid, postid, reason) VALUES ($1, $2, $3)`,
      [req.user.id, req.params.id, reason || 'Admin removal']
    );
    await pool.query('DELETE FROM posts WHERE postid=$1', [req.params.id]);
    res.json({ message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE COMMENT (admin)
router.delete('/comments/:id', async (req, res) => {
  try {
    const { reason } = req.body;
    await pool.query(
      `INSERT INTO removecomment (adminid, commentid, reason) VALUES ($1, $2, $3)`,
      [req.user.id, req.params.id, reason || 'Admin removal']
    );
    await pool.query('DELETE FROM comments WHERE commentid=$1', [req.params.id]);
    res.json({ message: 'Comment removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AUDIT LOG
router.get('/audit', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.logid, a.actiontype, a.targetentity, a.targetid, a.timestamp,
             u.username AS userusername, ad.username AS adminusername
      FROM auditlog a
      LEFT JOIN users u ON a.userid = u.userid
      LEFT JOIN admin ad ON a.adminid = ad.adminid
      ORDER BY a.timestamp DESC
      LIMIT 200
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ALERTS
router.get('/alerts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, ad.username AS adminusername FROM alerts a
      JOIN admin ad ON a.adminid = ad.adminid
      ORDER BY a.creationdate DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/alerts', async (req, res) => {
  try {
    const { message, alertType } = req.body;
    await pool.query(
      `INSERT INTO alerts (adminid, message, alerttype) VALUES ($1, $2, $3)`,
      [req.user.id, message, alertType || 'ANNOUNCEMENT']
    );
    res.json({ message: 'Alert created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;