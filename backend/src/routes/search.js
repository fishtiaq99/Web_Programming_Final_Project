const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  const { q, type } = req.query;
  if (!q) return res.json([]);
  const term = `%${q}%`;
  try {
    if (type === 'hashtag') {
      const result = await pool.query(`
        SELECT p.postid, p.contenttext, p.creationdate, u.username, u.userid,
               COUNT(DISTINCT l.likeid) FILTER (WHERE l.likedflag=true) AS likecount,
               COUNT(DISTINCT c.commentid) AS commentcount,
               COUNT(DISTINCT ml.likeid) FILTER (WHERE ml.userid=$2 AND ml.likedflag=true) AS isliked
        FROM posts p
        JOIN posthashtags ph ON p.postid = ph.postid
        JOIN hashtags h ON ph.hashtagid = h.hashtagid
        JOIN users u ON p.userid = u.userid
        LEFT JOIN likes l ON p.postid = l.postid
        LEFT JOIN likes ml ON p.postid = ml.postid AND ml.userid = $2
        LEFT JOIN comments c ON p.postid = c.postid
        WHERE h.phrase ILIKE $1
        GROUP BY p.postid, p.contenttext, p.creationdate, u.username, u.userid
        ORDER BY p.creationdate DESC
      `, [term, req.user.id]);
      return res.json(result.rows);
    }

    // user search
    const result = await pool.query(`
      SELECT userid, username, bio FROM users
      WHERE username ILIKE $1 AND isactive=true LIMIT 20
    `, [term]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;