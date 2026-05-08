const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET USER PROFILE
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.userid, u.username, u.bio, u.joindate,
        (SELECT COUNT(*) FROM follows WHERE followeeid=u.userid) AS followers,
        (SELECT COUNT(*) FROM follows WHERE followerid=u.userid) AS following,
        (SELECT COUNT(*) FROM posts WHERE userid=u.userid) AS postcount,
        (SELECT COUNT(*) FROM follows WHERE followerid=$2 AND followeeid=u.userid) AS isfollowing
      FROM users u WHERE u.userid=$1 AND u.isactive=true
    `, [req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET USER POSTS
router.get('/:id/posts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.postid, p.contenttext, p.mediaurl, p.creationdate,
             u.username, u.userid,
             COUNT(DISTINCT l.likeid) FILTER (WHERE l.likedflag = true) AS likecount,
             COUNT(DISTINCT c.commentid) AS commentcount,
             COUNT(DISTINCT ml.likeid) FILTER (WHERE ml.userid = $2 AND ml.likedflag = true) AS isliked
      FROM posts p
      JOIN users u ON p.userid = u.userid
      LEFT JOIN likes l ON p.postid = l.postid
      LEFT JOIN likes ml ON p.postid = ml.postid AND ml.userid = $2
      LEFT JOIN comments c ON p.postid = c.postid
      WHERE p.userid = $1
      GROUP BY p.postid, p.contenttext, p.mediaurl, p.creationdate, u.username, u.userid
      ORDER BY p.creationdate DESC
    `, [req.params.id, req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// FOLLOW / UNFOLLOW
router.post('/:id/follow', authenticateToken, async (req, res) => {
  const followeeID = parseInt(req.params.id);
  if (followeeID === req.user.id)
    return res.status(400).json({ error: 'Cannot follow yourself' });
  try {
    const existing = await pool.query(
      'SELECT 1 FROM follows WHERE followerid=$1 AND followeeid=$2',
      [req.user.id, followeeID]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM follows WHERE followerid=$1 AND followeeid=$2',
        [req.user.id, followeeID]
      );
      return res.json({ following: false });
    } else {
      await pool.query(
        'INSERT INTO follows (followerid, followeeid) VALUES ($1, $2)',
        [req.user.id, followeeID]
      );
      return res.json({ following: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE PROFILE
router.put('/me/profile', authenticateToken, [
  body('bio').optional().trim().isLength({ max: 500 }),
  body('username').optional().trim().isLength({ min: 3 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { bio, username } = req.body;
  try {
    await pool.query(
      'UPDATE users SET bio=$1, username=$2 WHERE userid=$3',
      [bio, username, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET FOLLOWERS LIST
router.get('/:id/followers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.userid, u.username, u.bio
      FROM follows f
      JOIN users u ON f.followerid = u.userid
      WHERE f.followeeid = $1 AND u.isactive = true
      ORDER BY u.username ASC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET FOLLOWING LIST
router.get('/:id/following', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.userid, u.username, u.bio
      FROM follows f
      JOIN users u ON f.followeeid = u.userid
      WHERE f.followerid = $1 AND u.isactive = true
      ORDER BY u.username ASC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;