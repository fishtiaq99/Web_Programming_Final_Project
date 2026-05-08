import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, UserPlus, Users, FileText, Calendar, X, Edit3, Heart, MessageCircle, Flame } from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #f97316, #dc2626)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #22c55e, #06b6d4)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #eab308, #f97316)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
];

const getBannerGradient = (username) => {
  const gradients = [
    'linear-gradient(135deg, rgba(249,115,22,0.3) 0%, rgba(239,68,68,0.15) 50%, transparent 100%)',
    'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.15) 50%, transparent 100%)',
    'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(6,182,212,0.15) 50%, transparent 100%)',
    'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(249,115,22,0.15) 50%, transparent 100%)',
  ];
  const idx = (username?.charCodeAt(0) || 0) % gradients.length;
  return gradients[idx];
};

const getAvatarGradient = (username) => {
  const idx = (username?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
};

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [modal, setModal] = useState(null);
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [followAnim, setFollowAnim] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [p, ps] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/posts`)
      ]);
      setProfile(p.data);
      setPosts(ps.data);
      setEditForm({ username: p.data.username, bio: p.data.bio || '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, [id]);

  const isFollowing = Number(profile?.isfollowing) > 0;

  const toggleFollow = async () => {
    setFollowAnim(true);
    setTimeout(() => setFollowAnim(false), 600);
    try {
      const res = await api.post(`/users/${id}/follow`);
      setProfile(prev => ({
        ...prev,
        isfollowing: res.data.following ? 1 : 0,
        followers: Number(prev.followers) + (res.data.following ? 1 : -1)
      }));
    } catch (err) { console.error(err); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/me/profile', editForm);
      setProfile(prev => ({ ...prev, ...editForm }));
      setEditing(false);
    } catch (err) { console.error(err); }
  };

  const openModal = async (type) => {
    setModal(type);
    setModalLoading(true);
    setModalUsers([]);
    try {
      const res = await api.get(`/users/${id}/${type}`);
      setModalUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setModalLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
      <Flame size={36} style={{ color: '#f97316', animation: 'pulse 1.2s ease-in-out infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <p style={{ color: '#4b5563', fontSize: '13px' }}>Loading profile...</p>
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
      <p style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>User not found</p>
    </div>
  );

  const isMe = parseInt(id) === me?.id;
  const avatarGradient = getAvatarGradient(profile.username);
  const bannerGradient = getBannerGradient(profile.username);
  const totalLikes = posts.reduce((sum, p) => sum + (Number(p.likecount) || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (Number(p.commentcount) || 0), 0);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heartBeat { 0%{transform:scale(1)} 25%{transform:scale(1.3)} 50%{transform:scale(1)} 75%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .profile-fade { animation: fadeUp 0.4s ease both; }
        .stat-btn:hover { opacity: 0.7; }
        .follow-anim { animation: heartBeat 0.6s ease; }
        .modal-user:hover { background: rgba(255,255,255,0.04) !important; }
        .edit-input:focus { border-color: rgba(249,115,22,0.4) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.08) !important; outline: none; }
      `}</style>

      {/* Followers/Following Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '16px', animation: 'fadeUp 0.2s ease'
        }} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{
            background: 'linear-gradient(135deg, #141414, #0f0f0f)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
            width: '100%', maxWidth: '360px', overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} style={{ color: '#f97316' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {modal === 'followers' ? 'Followers' : 'Following'}
                </h3>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {modalLoading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>Loading...</div>
              ) : modalUsers.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                    {modal === 'followers' ? '👥' : '🔍'}
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                    {modal === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                  </p>
                </div>
              ) : modalUsers.map(u => (
                <Link key={u.userid} to={`/profile/${u.userid}`} onClick={() => setModal(null)}
                  className="modal-user"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', textDecoration: 'none', transition: 'background 0.15s' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: getAvatarGradient(u.username), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '900', color: '#000', flexShrink: 0 }}>
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 2px' }}>@{u.username}</p>
                    {u.bio && <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{u.bio}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="profile-fade" style={{
        background: 'linear-gradient(135deg, rgba(18,18,18,0.98), rgba(12,12,12,0.98))',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
        overflow: 'hidden', marginBottom: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Banner */}
        <div style={{
          height: '120px', background: bannerGradient,
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '30%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <div style={{ position: 'absolute', top: '10px', left: '40%', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          {/* Avatar + Action */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-36px', marginBottom: '16px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: avatarGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: '900', color: '#000',
              border: '4px solid #0c0c0c',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
            }}>
              {profile.username?.[0]?.toUpperCase()}
            </div>

            {isMe ? (
              <button onClick={() => setEditing(!editing)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: editing ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${editing ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
                color: editing ? '#f87171' : '#d1d5db', fontSize: '13px', fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                <Edit3 size={13} />
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            ) : (
              <button onClick={toggleFollow}
                className={followAnim ? 'follow-anim' : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '10px 20px', borderRadius: '12px',
                  fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                  transition: 'all 0.2s', letterSpacing: '0.04em',
                  background: isFollowing
                    ? 'rgba(255,255,255,0.06)'
                    : 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: isFollowing ? '#d1d5db' : '#000',
                  border: isFollowing ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  boxShadow: isFollowing ? 'none' : '0 4px 15px rgba(249,115,22,0.3)'
                }}>
                {isFollowing ? <><UserCheck size={14} />Following</> : <><UserPlus size={14} />Follow</>}
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editing ? (
            <form onSubmit={saveProfile} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  className="edit-input"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#fff', transition: 'all 0.2s' }}
                  placeholder="Username" />
                <textarea value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })} rows={2}
                  className="edit-input"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#fff', resize: 'none', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  placeholder="Tell people about yourself..." maxLength={500} />
                <button type="submit" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#000', fontWeight: '800', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: '0 0 4px' }}>@{profile.username}</h1>
              {profile.bio ? (
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: '0 0 8px' }}>{profile.bio}</p>
              ) : isMe ? (
                <p style={{ color: '#4b5563', fontSize: '13px', fontStyle: 'italic', margin: '0 0 8px' }}>No bio yet — click Edit Profile to add one</p>
              ) : null}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '12px' }}>
                <Calendar size={12} style={{ color: '#f97316' }} />
                <span>Joined {new Date(profile.joindate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px', padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {[
              { label: 'Posts', value: Number(profile.postcount) || 0, icon: FileText, color: '#f97316', clickable: false },
              { label: 'Followers', value: Number(profile.followers) || 0, icon: Users, color: '#3b82f6', clickable: true, onClick: () => openModal('followers') },
              { label: 'Following', value: Number(profile.following) || 0, icon: UserCheck, color: '#22c55e', clickable: true, onClick: () => openModal('following') },
              { label: 'Likes', value: totalLikes, icon: Heart, color: '#f43f5e', clickable: false },
              { label: 'Comments', value: totalComments, icon: MessageCircle, color: '#a855f7', clickable: false },
            ].map(({ label, value, icon: Icon, color, clickable, onClick }) => (
              <button key={label} onClick={onClick}
                className={clickable ? 'stat-btn' : ''}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  background: 'none', border: 'none', cursor: clickable ? 'pointer' : 'default',
                  padding: '8px 4px', borderRadius: '10px', transition: 'all 0.2s'
                }}>
                <Icon size={14} style={{ color }} />
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>{value}</span>
                <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', letterSpacing: '0.05em' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="profile-fade" style={{ animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={14} style={{ color: '#f97316' }} />
          <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
            Posts · {posts.length}
          </p>
        </div>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✍️</div>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>
              {isMe ? "You haven't posted yet" : "No posts yet"}
            </p>
            <p style={{ color: '#4b5563', fontSize: '13px' }}>
              {isMe ? 'Share something with your campus!' : 'Check back later'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.map((p, i) => (
              <div key={p.postid} style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
                <PostCard post={p} onDelete={pid => setPosts(prev => prev.filter(x => x.postid !== pid))} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}