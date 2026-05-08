import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Home, Compass, User, LogOut, Shield, MessageSquare, Bell, X, Clock, Globe, Link2, AtSign, Mail, Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useInactivity } from '../hooks/useInactivity';

const PRIVACY_CONTENT = `
**Privacy Policy — Ignite University Social Platform**
Last updated: May 2025

1. INFORMATION WE COLLECT
We collect information you provide directly: username, email address, bio, posts, comments, and interactions. We also collect usage data such as search history and login timestamps for platform security and analytics.

2. HOW WE USE YOUR INFORMATION
Your data is used solely to operate the Ignite platform — to display your profile, deliver your feed, enable social interactions, and improve platform safety. We do not sell your data to third parties.

3. DATA SHARING
We share data only with university administrators for moderation purposes, and only when community guidelines are violated. No data is shared with external advertisers or commercial entities.

4. DATA RETENTION
Your data is retained for the duration of your account. Upon account deletion, personal data is removed within 30 days. Moderation logs may be retained for up to 1 year.

5. SECURITY
We use bcrypt password hashing, JWT-based session tokens, and HTTPS encryption. Access to admin tools is restricted by role-based authentication.

6. YOUR RIGHTS
You may request access to, correction of, or deletion of your personal data by contacting support through the platform.

7. CONTACT
For privacy concerns, submit an inquiry through the Support page.
`;

const TERMS_CONTENT = `
**Terms of Service — Ignite University Social Platform**
Last updated: May 2025

1. ELIGIBILITY
Ignite is a closed university social platform. Access is limited to registered students and faculty. By creating an account, you confirm you are affiliated with the university.

2. ACCEPTABLE USE
You agree not to post content that is hateful, harassing, defamatory, or violates any applicable law. You agree not to impersonate others, spam, or distribute malware.

3. CONTENT OWNERSHIP
You retain ownership of content you post. By posting, you grant Ignite a non-exclusive license to display that content on the platform. You may delete your content at any time.

4. MODERATION
Administrators may remove content that violates community guidelines. Repeated violations may result in account suspension or permanent ban.

5. ACCOUNT SECURITY
You are responsible for maintaining the confidentiality of your account credentials. Report unauthorized access immediately through the Support page.

6. DISCLAIMER
Ignite is provided as-is for educational purposes. The platform makes no warranties regarding uptime or data permanence.

7. CHANGES
We may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.

8. CONTACT
Questions about these terms? Submit an inquiry through the Support page.
`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [footerModal, setFooterModal] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    api.get('/alerts').then(r => setAlerts(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (showAlerts && !e.target.closest('#alerts-panel') && !e.target.closest('#alerts-btn')) {
        setShowAlerts(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAlerts]);

  useEffect(() => {
    if (footerModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [footerModal]);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!showWarning) { setCountdown(60); return; }
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [showWarning, countdown]);

  const handleExpire = async () => {
    setShowWarning(false);
    await logout();
    navigate('/login?reason=inactivity');
  };

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    setCountdown(60);
    api.get('/auth/me').catch(() => {});
  };

  useInactivity({
    onWarn: () => setShowWarning(true),
    onExpire: handleExpire,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em',
    textTransform: 'uppercase', textDecoration: 'none', padding: '6px 10px',
    borderRadius: '10px', transition: 'all 0.2s',
    color: isActive(path) ? '#f97316' : '#6b7280',
    background: isActive(path) ? 'rgba(249,115,22,0.1)' : 'transparent',
  });

  const renderModal = () => {
    if (!footerModal) return null;
    const isPrivacy = footerModal === 'privacy';
    const content = isPrivacy ? PRIVACY_CONTENT : TERMS_CONTENT;

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', animation: 'fadeIn 0.2s ease'
      }} onClick={e => { if (e.target === e.currentTarget) setFooterModal(null); }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(18,18,18,0.99), rgba(12,12,12,0.99))',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
          width: '100%', maxWidth: '560px', maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)', animation: 'slideUp 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                {isPrivacy ? '🔒' : '📋'}
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0 }}>{isPrivacy ? 'Privacy Policy' : 'Terms of Service'}</h2>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Last updated May 2025</p>
              </div>
            </div>
            <button onClick={() => setFooterModal(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {content.trim().split('\n').map((line, i) => {
              if (!line.trim()) return <div key={i} style={{ height: '8px' }} />;
              if (line.startsWith('**') && line.endsWith('**')) return <h3 key={i} style={{ fontSize: '13px', fontWeight: '800', color: '#f97316', letterSpacing: '0.05em', marginBottom: '4px', marginTop: i === 0 ? 0 : '8px' }}>{line.replace(/\*\*/g, '')}</h3>;
              if (/^\d+\./.test(line)) return <p key={i} style={{ fontSize: '13px', fontWeight: '700', color: '#e5e7eb', margin: '14px 0 4px' }}>{line}</p>;
              return <p key={i} style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.7', margin: '2px 0' }}>{line}</p>;
            })}
          </div>
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => setFooterModal(null)} style={{ width: '100%', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#000', fontWeight: '800', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Got it</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pageFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes warningPulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.4)} 50%{box-shadow:0 0 0 8px rgba(249,115,22,0)} }
        @keyframes menuSlide { from{opacity:0;transform:translateY(-12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .nav-link:hover { color: #f97316 !important; background: rgba(249,115,22,0.08) !important; }
        .logout-btn:hover { color: #f87171 !important; background: rgba(239,68,68,0.08) !important; }
        .alert-item:hover { background: rgba(255,255,255,0.03) !important; }
        .page-content { animation: pageFade 0.3s ease; }
        .footer-link:hover { color: #f97316 !important; }
        .social-btn:hover { background: rgba(249,115,22,0.15) !important; border-color: rgba(249,115,22,0.3) !important; color: #f97316 !important; transform: translateY(-2px); }
        .hamburger-line { display: block; width: 20px; height: 2px; background: #9ca3af; border-radius: 2px; transition: all 0.3s; }
        .mob-nav-link:hover { background: rgba(249,115,22,0.08) !important; color: #f97316 !important; }
        @media (min-width: 640px) { .hamburger-btn { display: none !important; } }
        @media (max-width: 639px) { .desktop-nav-links { display: none !important; } }
      `}</style>

      {/* ── INACTIVITY WARNING MODAL ── */}
      {showWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #141414, #0f0f0f)',
            border: '1px solid rgba(249,115,22,0.3)', borderRadius: '24px',
            padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center',
            animation: 'warningPulse 2s ease-in-out infinite, slideUp 0.25s ease',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(249,115,22,0.12)', border: '2px solid rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Clock size={28} style={{ color: '#f97316' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
              Still there?
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px', lineHeight: '1.6' }}>
              You've been inactive for a while. For your security, you'll be logged out in:
            </p>
            <div style={{
              fontSize: '48px', fontWeight: '900',
              color: countdown <= 10 ? '#f87171' : '#f97316',
              marginBottom: '24px', transition: 'color 0.3s'
            }}>
              {countdown}s
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleExpire}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                Log Out
              </button>
              <button onClick={handleStayLoggedIn}
                style={{
                  flex: 2, padding: '12px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  border: 'none', color: '#000', fontWeight: '800',
                  fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}

      {renderModal()}

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(249,115,22,0.15)' : '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none'
      }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 16px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/feed'} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Flame size={26} style={{ color: '#f97316', filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.5))' }} />
            <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff' }}>Ignite</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

            {/* ── DESKTOP NAV LINKS ── */}
            <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {!isAdmin && (
                <>
                  <Link to="/feed" className="nav-link" style={navLinkStyle('/feed')}><Home size={14} /><span>Home</span></Link>
                  <Link to="/explore" className="nav-link" style={navLinkStyle('/explore')}><Compass size={14} /><span>Explore</span></Link>
                  <Link to={`/profile/${user?.id}`} className="nav-link" style={navLinkStyle(`/profile/${user?.id}`)}><User size={14} /><span>Profile</span></Link>
                  <Link to="/contact" className="nav-link" style={navLinkStyle('/contact')}><MessageSquare size={14} /><span>Support</span></Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/explore" className="nav-link" style={navLinkStyle('/explore')}><Compass size={14} /><span>Explore</span></Link>
                  <Link to="/admin" className="nav-link" style={{ ...navLinkStyle('/admin'), color: '#f97316', background: isActive('/admin') ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <Shield size={14} /><span>Dashboard</span>
                  </Link>
                </>
              )}
            </div>

            {/* Divider — desktop only */}
            <div className="desktop-nav-links" style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)', margin: '0 8px' }} />

            {/* Alerts Bell */}
            <div style={{ position: 'relative' }}>
              <button id="alerts-btn" onClick={() => setShowAlerts(!showAlerts)}
                style={{ position: 'relative', background: showAlerts ? 'rgba(249,115,22,0.1)' : 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '10px', color: showAlerts ? '#f97316' : '#6b7280', transition: 'all 0.2s' }}>
                <Bell size={17} />
                {alerts.length > 0 && (
                  <span style={{ position: 'absolute', top: '4px', right: '4px', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#000', fontSize: '9px', fontWeight: '900', borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(249,115,22,0.4)' }}>
                    {alerts.length}
                  </span>
                )}
              </button>
              {showAlerts && (
                <div id="alerts-panel" style={{ position: 'absolute', right: 0, top: '48px', width: '320px', background: 'linear-gradient(135deg, rgba(18,18,18,0.98), rgba(12,12,12,0.98))', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'slideDown 0.2s ease', maxHeight: '380px', overflowY: 'auto' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f97316' }}>🔔 Alerts</span>
                    <button onClick={() => setShowAlerts(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '2px' }}><X size={14} /></button>
                  </div>
                  {alerts.length === 0 ? (
                    <p style={{ padding: '20px', color: '#4b5563', fontSize: '13px', textAlign: 'center' }}>No active alerts</p>
                  ) : alerts.map(a => (
                    <div key={a.alertid} className="alert-item" style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '20px', marginRight: '8px', background: a.alerttype === 'URGENT' ? 'rgba(239,68,68,0.15)' : a.alerttype === 'MAINTENANCE' ? 'rgba(234,179,8,0.15)' : a.alerttype === 'SAFETY' ? 'rgba(249,115,22,0.15)' : 'rgba(59,130,246,0.15)', color: a.alerttype === 'URGENT' ? '#f87171' : a.alerttype === 'MAINTENANCE' ? '#facc15' : a.alerttype === 'SAFETY' ? '#fb923c' : '#60a5fa' }}>{a.alerttype}</span>
                      <p style={{ color: '#d1d5db', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>{a.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User badge — desktop only */}
            <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px 5px 5px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', color: '#000' }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>@{user?.username}</span>
            </div>

            {/* Logout — desktop only */}
            <button onClick={handleLogout} className="logout-btn desktop-nav-links"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '8px', borderRadius: '10px', transition: 'all 0.2s' }} title="Sign out">
              <LogOut size={16} />
            </button>

            {/* ── HAMBURGER BUTTON (mobile only) ── */}
            <button
              className="hamburger-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', gap: '5px',
                background: showMobileMenu ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showMobileMenu ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', padding: '10px', cursor: 'pointer',
                marginLeft: '8px', transition: 'all 0.2s'
              }}>
              <span className="hamburger-line" style={{ transform: showMobileMenu ? 'rotate(45deg) translateY(7px)' : 'none', background: showMobileMenu ? '#f97316' : '#9ca3af' }} />
              <span className="hamburger-line" style={{ opacity: showMobileMenu ? 0 : 1, transform: showMobileMenu ? 'scaleX(0)' : 'none', background: showMobileMenu ? '#f97316' : '#9ca3af' }} />
              <span className="hamburger-line" style={{ transform: showMobileMenu ? 'rotate(-45deg) translateY(-7px)' : 'none', background: showMobileMenu ? '#f97316' : '#9ca3af' }} />
            </button>
          </div>
        </div>

        {/* ── MOBILE DROPDOWN MENU ── */}
        {showMobileMenu && (
          <div style={{
            position: 'absolute', top: '64px', left: 0, right: 0,
            background: 'linear-gradient(135deg, rgba(14,14,14,0.99), rgba(10,10,10,0.99))',
            borderBottom: '1px solid rgba(249,115,22,0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            animation: 'menuSlide 0.25s ease',
            zIndex: 49
          }}>
            {/* User info header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: 'linear-gradient(135deg, #f97316, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#000', flexShrink: 0, boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: '0 0 2px' }}>@{user?.username}</p>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: isAdmin ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.06)', color: isAdmin ? '#f97316' : '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {isAdmin ? '⚡ Admin' : 'Student'}
                </span>
              </div>
            </div>

            {/* Nav links */}
            <div style={{ padding: '8px' }}>
              {!isAdmin && [
                { to: '/feed', icon: Home, label: 'Home Feed', desc: 'See posts from people you follow' },
                { to: '/explore', icon: Compass, label: 'Explore', desc: 'Discover people and topics' },
                { to: `/profile/${user?.id}`, icon: User, label: 'My Profile', desc: 'View and edit your profile' },
                { to: '/contact', icon: MessageSquare, label: 'Support', desc: 'Get help from our team' },
              ].map(({ to, icon: Icon, label, desc }) => (
                <Link key={to} to={to}
                  className="mob-nav-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 14px', borderRadius: '12px',
                    textDecoration: 'none', transition: 'all 0.15s', marginBottom: '3px',
                    background: isActive(to) ? 'rgba(249,115,22,0.1)' : 'transparent',
                  }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: isActive(to) ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive(to) ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} style={{ color: isActive(to) ? '#f97316' : '#6b7280' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: isActive(to) ? '#f97316' : '#e5e7eb', margin: '0 0 1px' }}>{label}</p>
                    <p style={{ fontSize: '11px', color: '#4b5563', margin: 0 }}>{desc}</p>
                  </div>
                  {isActive(to) && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
                  )}
                </Link>
              ))}

              {isAdmin && [
                { to: '/explore', icon: Compass, label: 'Explore', desc: 'Browse posts and users' },
                { to: '/admin', icon: Shield, label: 'Dashboard', desc: 'Manage the platform' },
              ].map(({ to, icon: Icon, label, desc }) => (
                <Link key={to} to={to}
                  className="mob-nav-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 14px', borderRadius: '12px',
                    textDecoration: 'none', transition: 'all 0.15s', marginBottom: '3px',
                    background: isActive(to) ? 'rgba(249,115,22,0.1)' : 'transparent',
                  }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: isActive(to) ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive(to) ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} style={{ color: isActive(to) ? '#f97316' : '#6b7280' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: isActive(to) ? '#f97316' : '#e5e7eb', margin: '0 0 1px' }}>{label}</p>
                    <p style={{ fontSize: '11px', color: '#4b5563', margin: 0 }}>{desc}</p>
                  </div>
                  {isActive(to) && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
                  )}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
              <button onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)',
                  cursor: 'pointer', transition: 'all 0.15s', marginBottom: '4px'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LogOut size={15} style={{ color: '#f87171' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#f87171', margin: '0 0 1px' }}>Sign Out</p>
                  <p style={{ fontSize: '11px', color: '#4b5563', margin: 0 }}>See you next time!</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main style={{ paddingTop: '64px', maxWidth: '1024px', margin: '0 auto', padding: '80px 16px 32px' }}>
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: '80px',
        background: 'linear-gradient(to bottom, transparent, rgba(249,115,22,0.02))'
      }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '48px 16px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Flame size={20} style={{ color: '#f97316' }} />
              <span style={{ fontWeight: '900', letterSpacing: '0.15em', fontSize: '16px', textTransform: 'uppercase', color: '#fff' }}>Ignite</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7', marginBottom: '20px', maxWidth: '220px' }}>
              The official social platform for university students and faculty. Connect, share, and ignite ideas.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { icon: Globe, label: 'Website', href: 'https://university.edu' },
                { icon: Link2, label: 'LinkedIn', href: 'https://linkedin.com' },
                { icon: AtSign, label: 'Contact', href: 'mailto:support@ignite.university.edu' },
              ].map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                  className="social-btn"
                  style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none', transition: 'all 0.2s' }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f97316', marginBottom: '16px' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {!isAdmin ? (
                <>
                  <Link to="/feed" className="footer-link" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}>Home Feed</Link>
                  <Link to="/explore" className="footer-link" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}>Explore</Link>
                  <Link to={`/profile/${user?.id}`} className="footer-link" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}>My Profile</Link>
                  <Link to="/contact" className="footer-link" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}>Support</Link>
                </>
              ) : (
                <>
                  <Link to="/admin" className="footer-link" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}>Dashboard</Link>
                  <Link to="/explore" className="footer-link" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}>Explore</Link>
                </>
              )}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f97316', marginBottom: '16px' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setFooterModal('privacy')} className="footer-link" style={{ color: '#6b7280', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}>Privacy Policy</button>
              <button onClick={() => setFooterModal('terms')} className="footer-link" style={{ color: '#6b7280', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}>Terms of Service</button>
              <button onClick={() => setFooterModal('privacy')} className="footer-link" style={{ color: '#6b7280', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}>Cookie Policy</button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f97316', marginBottom: '16px' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: Mail, text: 'support@ignite.university.edu' },
                { icon: Phone, text: '+1 (555) 123-4567' },
                { icon: MapPin, text: 'University Campus, Main Building' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(249,115,22,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={13} style={{ color: '#f97316' }} />
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '12px', lineHeight: '1.4' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', maxWidth: '1024px', margin: '0 auto' }}>
          <p style={{ color: '#374151', fontSize: '12px', margin: 0 }}>© 2025 Ignite University Social Platform. All rights reserved.</p>
          <p style={{ color: '#374151', fontSize: '12px', margin: 0 }}>Built with ❤️ for university communities</p>
        </div>
      </footer>
    </div>
  );
}