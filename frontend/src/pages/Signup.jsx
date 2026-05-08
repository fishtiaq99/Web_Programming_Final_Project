import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, User, Eye, EyeOff, FileText, CheckCircle } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', bio: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3) e.username = 'At least 3 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await signup({ username: form.username, email: form.email, password: form.password, bio: form.bio });
      navigate('/feed');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Signup failed' });
    } finally { setLoading(false); }
  };

  const getStrength = () => {
    const p = form.password;
    if (!p) return null;
    const score = [p.length >= 8, p.length >= 12, /[A-Z]/.test(p), /[0-9]/.test(p), /[^a-zA-Z0-9]/.test(p)].filter(Boolean).length;
    if (score >= 4) return { label: 'Strong', color: '#22c55e', width: '100%' };
    if (score >= 3) return { label: 'Good', color: '#eab308', width: '66%' };
    return { label: 'Weak', color: '#ef4444', width: '33%' };
  };
  const strength = getStrength();

  const inputStyle = (hasError) => ({
    width: '100%', background: '#0f0f0f',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '12px', padding: '12px 14px 12px 42px',
    fontSize: '14px', color: '#fff', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s'
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">

      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)',
          animation: 'float1 9s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)',
          animation: 'float2 11s ease-in-out infinite'
        }} />
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-25px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(20px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes flamePulse { 0%,100%{filter:drop-shadow(0 0 8px rgba(249,115,22,0.6))} 50%{filter:drop-shadow(0 0 18px rgba(249,115,22,0.9))} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .su-input:focus { border-color: rgba(249,115,22,0.5) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.08) !important; }
        .fade-up { animation: fadeSlideUp 0.5s ease forwards; }
        .flame-icon { animation: flamePulse 2s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-md relative z-10 fade-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Flame className="flame-icon" size={36} style={{ color: '#f97316' }} />
            <span style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff' }}>Ignite</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '12px', letterSpacing: '0.1em' }}>Join your university community</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(15,15,15,0.95))',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>Create Account</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>Fill in your details to get started</p>

          {errors.general && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', padding: '12px 16px', marginBottom: '16px'
            }}>
              <span style={{ color: '#f87171', fontSize: '13px' }}>⚠ {errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none' }} />
                <input type="text" value={form.username} className="su-input"
                  onChange={e => { setForm({ ...form, username: e.target.value }); setErrors({ ...errors, username: '' }); }}
                  style={inputStyle(errors.username)} placeholder="your_username" autoComplete="username" />
              </div>
              {errors.username && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>⚠ {errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none' }} />
                <input type="email" value={form.email} className="su-input"
                  onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                  style={inputStyle(errors.email)} placeholder="you@university.edu" autoComplete="email" />
              </div>
              {errors.email && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none' }} />
                <input type={showPass ? 'text' : 'password'} value={form.password} className="su-input"
                  onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                  style={{ ...inputStyle(errors.password), paddingRight: '42px' }}
                  placeholder="min. 8 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {strength && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '2px', transition: 'width 0.3s, background 0.3s' }} />
                  </div>
                  <p style={{ fontSize: '11px', color: strength.color, marginTop: '3px' }}>Password strength: {strength.label}</p>
                </div>
              )}
              {errors.password && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>⚠ {errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4b5563', pointerEvents: 'none' }} />
                <input type="password" value={form.confirmPassword} className="su-input"
                  onChange={e => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }); }}
                  style={inputStyle(errors.confirmPassword)} placeholder="repeat password" autoComplete="new-password" />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle size={15} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e' }} />
                )}
              </div>
              {errors.confirmPassword && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>⚠ {errors.confirmPassword}</p>}
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>
                Bio <span style={{ color: '#374151', textTransform: 'none', fontWeight: '400' }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <FileText size={14} style={{ position: 'absolute', left: '14px', top: '14px', color: '#4b5563', pointerEvents: 'none' }} />
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2}
                  className="su-input"
                  style={{ ...inputStyle(false), padding: '12px 14px 12px 42px', resize: 'none', fontFamily: 'inherit' }}
                  placeholder="Tell us about yourself..." maxLength={500} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', marginTop: '4px',
                background: loading ? '#92400e' : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#000', fontWeight: '800', padding: '14px',
                borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'all 0.2s', opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ width: '14px', height: '14px', border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '20px' }}>
            Have an account?{' '}
            <Link to="/login" style={{ color: '#f97316', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}