import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Send, HeadphonesIcon, Mail, Zap, Shield, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';

const FAQS = [
  { q: 'How do I reset my password?', a: "Click 'Forgot Password' on the login page and enter your university email. You'll receive a reset link within minutes." },
  { q: 'Can I change my username?', a: 'Yes! Go to your profile and click Edit Profile. You can update your username and bio anytime.' },
  { q: 'How do I report inappropriate content?', a: 'Click the flag icon on any post or comment. Our moderation team reviews all reports within 24 hours.' },
  { q: 'Why was my post removed?', a: 'Posts are removed when they violate community guidelines. You can appeal through this support page.' },
  { q: 'How do I delete my account?', a: 'Submit an inquiry here with your deletion request. Our team will process it within 3–5 business days.' },
];

const SUPPORT_FEATURES = [
  { icon: Zap, title: 'Fast Response', desc: 'We typically respond within 24 hours', color: '#f97316' },
  { icon: Shield, title: 'Safe & Secure', desc: 'Your messages are private and encrypted', color: '#22c55e' },
  { icon: BookOpen, title: 'Knowledge Base', desc: 'Check FAQs below for instant answers', color: '#3b82f6' },
];

export default function Contact() {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myInquiries, setMyInquiries] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const loadInquiries = () =>
    api.get('/inquiries/mine').then(r => setMyInquiries(r.data)).catch(() => {});

  useEffect(() => { loadInquiries(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 10) return;
    setSubmitting(true);
    try {
      await api.post('/inquiries', { message });
      setMessage('');
      setCharCount(0);
      setSuccess(true);
      await loadInquiries();
      setTimeout(() => setSuccess(false), 4000);
    } catch { } finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes successPop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        .contact-fade { animation: fadeUp 0.4s ease both; }
        .faq-item:hover { border-color: rgba(249,115,22,0.2) !important; }
        .contact-input:focus { border-color: rgba(249,115,22,0.4) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.08) !important; outline: none; }
        .feature-card:hover { border-color: rgba(255,255,255,0.12) !important; transform: translateY(-2px); }
        .inquiry-card:hover { border-color: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* Hero */}
      <div className="contact-fade" style={{ marginBottom: '32px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '200px', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{
          width: '64px', height: '64px', borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.1))',
          border: '1px solid rgba(249,115,22,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(249,115,22,0.15)'
        }}>
          <HeadphonesIcon size={28} style={{ color: '#f97316' }} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          How can we help?
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
          Our support team is here for you. Submit a question or browse the FAQ below.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="contact-fade" style={{ animationDelay: '0.05s', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '28px' }}>
        {SUPPORT_FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="feature-card" style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '16px', textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>{title}</p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Submit Form */}
      <div className="contact-fade" style={{
        animationDelay: '0.1s',
        background: 'linear-gradient(135deg, rgba(18,18,18,0.98), rgba(12,12,12,0.98))',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
        padding: '28px', marginBottom: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={18} style={{ color: '#f97316' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0 }}>Send a Message</h2>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>We'll get back to you within 24 hours</p>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '14px', padding: '14px 18px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px',
            animation: 'successPop 0.4s ease'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={16} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p style={{ color: '#4ade80', fontSize: '13px', fontWeight: '700', margin: 0 }}>Message sent successfully!</p>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>We'll respond to your inquiry soon.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>
              Your Message
            </label>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); setCharCount(e.target.value.length); }}
              className="contact-input"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '14px',
                fontSize: '14px', color: '#e5e7eb', resize: 'none',
                fontFamily: 'inherit', lineHeight: '1.6',
                boxSizing: 'border-box', transition: 'all 0.2s'
              }}
              rows={5}
              placeholder="Describe your issue or question in detail. The more info you provide, the faster we can help!"
              maxLength={1000}
              required
              minLength={10}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              {message.length > 0 && message.length < 10 && (
                <p style={{ color: '#f87171', fontSize: '11px', margin: 0 }}>⚠ Please write at least 10 characters</p>
              )}
              <span style={{ fontSize: '11px', color: charCount > 900 ? '#f97316' : '#4b5563', marginLeft: 'auto' }}>
                {charCount}/1000
              </span>
            </div>
          </div>

          <button type="submit" disabled={submitting || message.length < 10}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', background: submitting || message.length < 10
                ? 'rgba(249,115,22,0.3)'
                : 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#000', fontWeight: '800', padding: '14px',
              borderRadius: '12px', border: 'none',
              cursor: submitting || message.length < 10 ? 'not-allowed' : 'pointer',
              fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}>
            <Send size={14} />
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="contact-fade" style={{ animationDelay: '0.15s', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BookOpen size={14} style={{ color: '#f97316' }} />
          <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
            Frequently Asked Questions
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#e5e7eb' }}>{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp size={16} style={{ color: '#f97316', flexShrink: 0 }} />
                  : <ChevronDown size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
                }
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 18px 14px', animation: 'slideIn 0.2s ease' }}>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '12px' }} />
                  <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Past Inquiries */}
      {myInquiries.length > 0 && (
        <div className="contact-fade" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <MessageSquare size={14} style={{ color: '#f97316' }} />
            <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>
              My Inquiries · {myInquiries.length}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myInquiries.map((inq, i) => (
              <div key={inq.inquiryid || i} className="inquiry-card"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px 18px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                  <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.6', margin: 0, flex: 1 }}>{inq.message}</p>
                  <span style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
                    background: inq.statusflag ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                    color: inq.statusflag ? '#4ade80' : '#facc15',
                    border: `1px solid ${inq.statusflag ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}`
                  }}>
                    {inq.statusflag
                      ? <><CheckCircle size={10} />Resolved</>
                      : <><Clock size={10} />Pending</>
                    }
                  </span>
                </div>
                {inq.adminresponse && (
                  <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '10px', padding: '12px 14px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000', fontWeight: '900' }}>A</div>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#f97316', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Response</p>
                    </div>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, lineHeight: '1.6' }}>{inq.adminresponse}</p>
                  </div>
                )}
                {inq.submitdate && (
                  <p style={{ fontSize: '11px', color: '#4b5563', margin: '8px 0 0' }}>
                    Submitted {new Date(inq.submitdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}