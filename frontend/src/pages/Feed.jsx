import { useState, useEffect } from 'react';
import { Flame, Plus, X, Hash, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PostCard from '../components/PostCard';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ contentText: '', hashtags: '' });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const loadFeed = async () => {
    try {
      const res = await api.get('/posts/feed');
      setPosts(res.data);
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeed(); }, []);

  const createPost = async (e) => {
    e.preventDefault();
    if (!newPost.contentText.trim()) { setError('Post content required'); return; }
    setPosting(true); setError('');
    try {
      const hashtags = newPost.hashtags.split(' ').map(h => h.trim()).filter(h => h.startsWith('#'));
      await api.post('/posts', { contentText: newPost.contentText, hashtags });
      setNewPost({ contentText: '', hashtags: '' });
      setShowCreate(false);
      await loadFeed();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post');
    } finally { setPosting(false); }
  };

  const deletePost = async (postID) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postID}`);
      setPosts(prev => prev.filter(p => p.postid !== postID));
    } catch (err) { console.error('Delete error:', err); }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .post-item { animation: fadeUp 0.4s ease both; }
        .create-panel { animation: slideDown 0.25s ease; }
        .create-btn:hover .create-icon { transform: rotate(45deg); }
        .create-icon { transition: transform 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Sparkles size={18} style={{ color: '#f97316' }} />
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em' }}>
            Your Feed
          </h1>
        </div>
        <p style={{ color: '#4b5563', fontSize: '13px' }}>Posts from people you follow</p>
      </div>

      {/* Create Post Trigger */}
      <button
        onClick={() => setShowCreate(!showCreate)}
        className="create-btn"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '14px 18px', cursor: 'pointer',
          marginBottom: '16px', transition: 'all 0.2s',
          boxShadow: showCreate ? '0 0 0 2px rgba(249,115,22,0.3)' : 'none'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #dc2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '15px', fontWeight: '900', color: '#000' }}>
            {user?.username?.[0]?.toUpperCase()}
          </span>
        </div>
        <span style={{ color: '#4b5563', fontSize: '14px', flex: 1, textAlign: 'left' }}>
          What's on your mind, @{user?.username}?
        </span>
        <div className="create-icon" style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'rgba(249,115,22,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Plus size={16} style={{ color: '#f97316' }} />
        </div>
      </button>

      {/* Create Post Panel */}
      {showCreate && (
        <div className="create-panel" style={{
          background: 'linear-gradient(135deg, rgba(20,20,20,0.98), rgba(15,15,15,0.98))',
          border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: '20px', padding: '20px', marginBottom: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(249,115,22,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '900', color: '#000'
              }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>@{user?.username}</p>
                <p style={{ fontSize: '11px', color: '#6b7280' }}>New post</p>
              </div>
            </div>
            <button onClick={() => setShowCreate(false)}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.target.style.color = '#6b7280'; e.target.style.background = 'transparent'; }}>
              <X size={16} />
            </button>
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '12px', marginBottom: '10px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>
              ⚠ {error}
            </p>
          )}

          <form onSubmit={createPost}>
            <textarea
              value={newPost.contentText}
              onChange={e => setNewPost({ ...newPost, contentText: e.target.value })}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '14px',
                fontSize: '14px', color: '#e5e7eb', resize: 'none',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                lineHeight: '1.6', marginBottom: '10px',
                transition: 'border-color 0.2s'
              }}
              rows={4}
              placeholder="Share something with your campus..."
              maxLength={1000}
              required
              onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.3)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />

            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Hash size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none' }} />
              <input
                value={newPost.hashtags}
                onChange={e => setNewPost({ ...newPost, hashtags: e.target.value })}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '10px 12px 10px 32px',
                  fontSize: '13px', color: '#d1d5db', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
                placeholder="#hashtag1 #hashtag2"
                onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: newPost.contentText.length > 900 ? '#f97316' : '#374151' }}>
                {newPost.contentText.length}/1000
              </span>
              <button type="submit" disabled={posting} style={{
                background: posting ? '#92400e' : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#000', fontWeight: '800', padding: '10px 24px',
                borderRadius: '10px', border: 'none', cursor: posting ? 'not-allowed' : 'pointer',
                fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'all 0.2s', opacity: posting ? 0.7 : 1
              }}
                onMouseEnter={e => { if (!posting) e.target.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                {posting ? 'Posting...' : '🔥 Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
          <Flame size={36} style={{ color: '#f97316', animation: 'pulse 1.2s ease-in-out infinite' }} />
          <p style={{ color: '#4b5563', fontSize: '13px' }}>Loading your feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Flame size={32} style={{ color: 'rgba(249,115,22,0.4)' }} />
          </div>
          <p style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Nothing here yet</p>
          <p style={{ color: '#4b5563', fontSize: '13px' }}>Follow people or create your first post!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post, i) => (
            <div key={post.postid} className="post-item" style={{ animationDelay: `${i * 0.05}s` }}>
              <PostCard post={post} onDelete={deletePost} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}