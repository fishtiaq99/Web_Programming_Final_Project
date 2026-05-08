import { useState, useEffect } from 'react';
import { Search, Hash, Users, TrendingUp, Sparkles, BookOpen, Code, Microscope, Palette, Globe, Music, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const TRENDING_TAGS = [
  { tag: 'ComputerScience', icon: Code, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { tag: 'Biology', icon: Microscope, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  { tag: 'FineArts', icon: Palette, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { tag: 'Engineering', icon: Zap, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { tag: 'Literature', icon: BookOpen, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { tag: 'Music', icon: Music, color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  { tag: 'InternationalRelations', icon: Globe, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { tag: 'DataScience', icon: TrendingUp, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
];

export default function Explore() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('user');
  const [results, setResults] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    api.get('/posts').then(r => setAllPosts(r.data)).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}&type=${type}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleTagClick = async (tag) => {
    setQuery(tag);
    setType('hashtag');
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(tag)}&type=hashtag`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .explore-fade { animation: fadeUp 0.4s ease both; }
        .tag-chip:hover { transform: translateY(-2px) scale(1.03); }
        .user-card:hover { border-color: rgba(249,115,22,0.3) !important; transform: translateX(4px); }
        .search-input:focus { border-color: rgba(249,115,22,0.4) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.08) !important; outline: none; }
      `}</style>

      {/* Hero Header */}
      <div className="explore-fade" style={{ marginBottom: '32px', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '0',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.1))',
            border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={20} style={{ color: '#f97316' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Explore</h1>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Discover people, posts and topics</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="explore-fade" style={{ animationDelay: '0.05s', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="search-input"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '13px 14px 13px 42px',
                fontSize: '14px', color: '#fff', boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              placeholder={type === 'user' ? 'Search for students...' : 'Search hashtags e.g. ComputerScience'}
            />
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', background: '#0f0f0f', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {[
              { value: 'user', icon: Users, label: 'People' },
              { value: 'hashtag', icon: Hash, label: 'Tags' }
            ].map(({ value, icon: Icon, label }) => (
              <button key={value} type="button"
                onClick={() => { setType(value); setResults([]); setHasSearched(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '10px 14px', fontSize: '12px', fontWeight: '700',
                  letterSpacing: '0.05em', border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: type === value ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'transparent',
                  color: type === value ? '#000' : '#6b7280'
                }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          <button type="submit" disabled={searching} style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#000', fontWeight: '800', padding: '12px 20px',
            borderRadius: '12px', border: 'none', cursor: searching ? 'not-allowed' : 'pointer',
            fontSize: '13px', letterSpacing: '0.05em', transition: 'all 0.2s',
            opacity: searching ? 0.7 : 1, whiteSpace: 'nowrap'
          }}>
            {searching ? '...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Trending Topics */}
      {!hasSearched && (
        <div className="explore-fade" style={{ animationDelay: '0.1s', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <TrendingUp size={14} style={{ color: '#f97316' }} />
            <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>Trending Topics</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TRENDING_TAGS.map(({ tag, icon: Icon, color, bg }) => (
              <button key={tag} onClick={() => handleTagClick(tag)}
                className="tag-chip"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '20px',
                  background: bg, border: `1px solid ${color}30`,
                  color: color, fontSize: '12px', fontWeight: '700',
                  cursor: 'pointer', transition: 'all 0.2s',
                  letterSpacing: '0.03em'
                }}>
                <Icon size={12} />#{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && results.length > 0 && (
        <div className="explore-fade">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316' }} />
            <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {type === 'hashtag' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map(p => <PostCard key={p.postid} post={p} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map((u, i) => (
                <Link key={u.userid} to={`/profile/${u.userid}`}
                  className="user-card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', padding: '14px 18px',
                    textDecoration: 'none', transition: 'all 0.2s',
                    animation: `fadeUp 0.3s ease ${i * 0.05}s both`
                  }}>
                  {/* Avatar */}
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                    background: `linear-gradient(135deg, #f97316, #dc2626)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '900', color: '#000',
                    boxShadow: '0 4px 12px rgba(249,115,22,0.3)'
                  }}>
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: '0 0 2px' }}>@{u.username}</p>
                    {u.bio && <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</p>}
                  </div>
                  <div style={{ fontSize: '18px', color: '#374151' }}>→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {hasSearched && results.length === 0 && !searching && (
        <div className="explore-fade" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <p style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>No results found</p>
          <p style={{ color: '#4b5563', fontSize: '13px' }}>Try a different search term or browse recent posts below</p>
        </div>
      )}

      {/* Recent Posts */}
      {!hasSearched && (
        <div className="explore-fade" style={{ animationDelay: '0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={14} style={{ color: '#f97316' }} />
            <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>Recent Posts</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allPosts.slice(0, 10).map((p, i) => (
              <div key={p.postid} style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}>
                <PostCard post={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}