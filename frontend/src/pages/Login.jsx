import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, Eye, EyeOff, Shield, User, Clock } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const inactivityLogout = params.get('reason') === 'inactivity';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('All fields required'); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Invalid email format'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password, isAdmin);
      navigate(user.role === 'admin' ? '/admin' : '/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
          animation: 'float1 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
          animation: 'float2 10s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '20%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)',
          animation: 'float1 12s ease-in-out infinite reverse'
        }} />
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flamePulse {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(249,115,22,0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(249,115,22,0.9)); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up { animation: fadeSlideUp 0.5s ease forwards; }
        .flame-icon { animation: flamePulse 2s ease-in-out infinite; }
        .input-field { transition: border-color 0.2s, box-shadow 0.2s; }
        .input-field:focus {
          border-color: rgba(249,115,22,0.5) !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
          outline: none;
        }
        .btn-primary {
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.4s;
        }
        .btn-primary:hover::after { transform: translateX(100%); }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(249,115,22,0.3); }
        .btn-primary:active { transform: translateY(0); }
      `}</style>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-10 fade-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <Flame className="flame-icon" size={44} style={{ color: '#f97316' }} />
            <span style={{
              fontSize: '42px', fontWeight: '900',
              letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff'
            }}>
              Ignite
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to right, transparent, rgba(249,115,22,0.4))' }} />
            <p style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              University Social Platform
            </p>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to left, transparent, rgba(249,115,22,0.4))' }} />
          </div>
        </div>

        {/* Card */}
        <div className="fade-up" style={{
          animationDelay: '0.1s', opacity: 0,
          background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(15,15,15,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '36px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>

          {/* Inactivity notice */}
          {inactivityLogout && (
            <div style={{
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: '12px', padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Clock size={16} style={{ color: '#f97316', flexShrink: 0 }} />
              <span style={{ color: '#fb923c', fontSize: '13px', lineHeight: '1.5' }}>
                You were logged out due to inactivity. Please sign in again.
              </span>
            </div>
          )}

          {/* Role Toggle */}
          <div style={{
            display: 'flex', background: '#0a0a0a', borderRadius: '12px',
            padding: '4px', marginBottom: '28px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            {[
              { label: 'Student', icon: User, value: false },
              { label: 'Admin', icon: Shield, value: true }
            ].map(({ label, icon: Icon, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setIsAdmin(value)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', padding: '10px',
                  borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  transition: 'all 0.2s',
                  background: isAdmin === value
                    ? 'linear-gradient(135deg, #f97316, #ea580c)'
                    : 'transparent',
                  color: isAdmin === value ? '#000' : '#6b7280',
                  boxShadow: isAdmin === value ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
                  border: 'none', cursor: 'pointer'
                }}
              >
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
            {isAdmin ? '⚡ Admin Access' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
            {isAdmin ? 'Restricted area — admins only' : 'Sign in to your account'}
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ color: '#f87171', fontSize: '13px' }}>⚠ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: '700',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#6b7280', marginBottom: '8px'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none'
                }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  style={{
                    width: '100%', background: '#0f0f0f',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '13px 14px 13px 42px',
                    fontSize: '14px', color: '#fff',
                    boxSizing: 'border-box'
                  }}
                  placeholder="you@university.edu"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: '700',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#6b7280', marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none'
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                  style={{
                    width: '100%', background: '#0f0f0f',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '13px 42px 13px 42px',
                    fontSize: '14px', color: '#fff',
                    boxSizing: 'border-box'
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', color: '#4b5563',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px', transition: 'color 0.2s',
                    display: 'flex', alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', marginTop: '4px',
                background: loading
                  ? '#92400e'
                  : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#000', fontWeight: '800', padding: '14px',
                borderRadius: '12px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px', letterSpacing: '0.1em',
                textTransform: 'uppercase',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{
                    width: '14px', height: '14px',
                    border: '2px solid rgba(0,0,0,0.4)',
                    borderTopColor: '#000', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  Signing in...
                </span>
              ) : (
                `Sign In as ${isAdmin ? 'Admin' : 'Student'}`
              )}
            </button>
          </form>

          {!isAdmin && (
            <p style={{
              textAlign: 'center', fontSize: '13px',
              color: '#6b7280', marginTop: '24px'
            }}>
              No account?{' '}
              <Link
                to="/signup"
                style={{ color: '#f97316', fontWeight: '600', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#fb923c'}
                onMouseLeave={e => e.target.style.color = '#f97316'}
              >
                Create one
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}