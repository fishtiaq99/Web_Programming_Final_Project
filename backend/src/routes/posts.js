const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// FEED
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.postid, p.contenttext, p.mediaurl, p.creationdate,
             u.username, u.userid,
             COUNT(DISTINCT l.likeid) FILTER (WHERE l.likedflag = true) AS likecount,
             COUNT(DISTINCT c.commentid) AS commentcount,
             COUNT(DISTINCT ml.likeid) FILTER (WHERE ml.userid = $1 AND ml.likedflag = true) AS isliked,
             STRING_AGG(DISTINCT h.phrase, ',') AS hashtags
      FROM posts p
      JOIN users u ON p.userid = u.userid
      LEFT JOIN likes l ON p.postid = l.postid
      LEFT JOIN likes ml ON p.postid = ml.postid AND ml.userid = $1
      LEFT JOIN comments c ON p.postid = c.postid
      LEFT JOIN posthashtags ph ON p.postid = ph.postid
      LEFT JOIN hashtags h ON ph.hashtagid = h.hashtagid
      WHERE p.userid = $1
         OR p.userid IN (SELECT followeeid FROM follows WHERE followerid = $1)
      GROUP BY p.postid, p.contenttext, p.mediaurl, p.creationdate, u.username, u.userid
      ORDER BY p.creationdate DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ALL POSTS (explore)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.postid, p.contenttext, p.mediaurl, p.creationdate,
             u.username, u.userid,
             COUNT(DISTINCT l.likeid) FILTER (WHERE l.likedflag = true) AS likecount,
             COUNT(DISTINCT c.commentid) AS commentcount,
             COUNT(DISTINCT ml.likeid) FILTER (WHERE ml.userid = $1 AND ml.likedflag = true) AS isliked
      FROM posts p
      JOIN users u ON p.userid = u.userid
      LEFT JOIN likes l ON p.postid = l.postid
      LEFT JOIN likes ml ON p.postid = ml.postid AND ml.userid = $1
      LEFT JOIN comments c ON p.postid = c.postid
      GROUP BY p.postid, p.contenttext, p.mediaurl, p.creationdate, u.username, u.userid
      ORDER BY p.creationdate DESC
      LIMIT 50
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE POST
router.post('/', authenticateToken, [
  body('contentText').trim().isLength({ min: 1, max: 1000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { contentText, mediaURL, hashtags } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO posts (userid, contenttext, mediaurl)
       VALUES ($1, $2, $3) RETURNING postid`,
      [req.user.id, contentText, mediaURL || null]
    );
    const postID = result.rows[0].postid;

    if (hashtags && hashtags.length > 0) {
      for (const tag of hashtags) {
        const phrase = tag.replace('#', '').trim();
        if (!phrase) continue;

        const existing = await pool.query(
          'SELECT hashtagid FROM hashtags WHERE phrase=$1', [phrase]
        );
        let hashtagID;
        if (existing.rows.length === 0) {
          const ins = await pool.query(
            'INSERT INTO hashtags (phrase) VALUES ($1) RETURNING hashtagid', [phrase]
          );
          hashtagID = ins.rows[0].hashtagid;
        } else {
          hashtagID = existing.rows[0].hashtagid;
        }

        await pool.query(
          'INSERT INTO posthashtags (postid, hashtagid) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [postID, hashtagID]
        );
      }
    }

    res.status(201).json({ postID, message: 'Post created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE POST
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const check = await pool.query(
      'SELECT userid FROM posts WHERE postid=$1', [req.params.id]
    );
    if (!check.rows.length) return res.status(404).json({ error: 'Post not found' });
    if (check.rows[0].userid !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });

    await pool.query('DELETE FROM posts WHERE postid=$1', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// LIKE / UNLIKE
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT likedflag FROM likes WHERE userid=$1 AND postid=$2',
      [req.user.id, req.params.id]
    );
    if (existing.rows.length > 0) {
      const newFlag = !existing.rows[0].likedflag;
      await pool.query(
        'UPDATE likes SET likedflag=$1 WHERE userid=$2 AND postid=$3',
        [newFlag, req.user.id, req.params.id]
      );
      return res.json({ liked: newFlag });
    } else {
      await pool.query(
        'INSERT INTO likes (userid, postid, likedflag) VALUES ($1, $2, true)',
        [req.user.id, req.params.id]
      );
      return res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET COMMENTS
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.commentid, c.contenttext, c.creationdate, u.username, u.userid
      FROM comments c JOIN users u ON c.userid = u.userid
      WHERE c.postid=$1 ORDER BY c.creationdate ASC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADD COMMENT
router.post('/:id/comments', authenticateToken, [
  body('contentText').trim().isLength({ min: 1, max: 500 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const result = await pool.query(
      `INSERT INTO comments (userid, postid, contenttext)
       VALUES ($1, $2, $3) RETURNING commentid`,
      [req.user.id, req.params.id, req.body.contentText]
    );
    res.status(201).json({ commentID: result.rows[0].commentid });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// REPORT POST
router.post('/:id/report', authenticateToken, [
  body('reason').trim().isLength({ min: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await pool.query(
      `INSERT INTO reports (reporteruserid, postid, reason) VALUES ($1, $2, $3)`,
      [req.user.id, req.params.id, req.body.reason]
    );
    res.json({ message: 'Reported' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;