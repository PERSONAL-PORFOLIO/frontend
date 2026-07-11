import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { App } from 'antd';
import { ArrowRightOutlined, CodeOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

/* ─── Shared input field wrapper ─── */
const Field = ({ label, error, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.83rem', fontWeight: 500, marginBottom: 7 }}>
      {label}
    </label>
    {children}
    {error && <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: 5 }}>{error}</div>}
  </div>
);

/* ─── Input styles ─── */
const INPUT_BASE = {
  width: '100%',
  height: 50,
  background: 'rgba(10,10,20,0.6)',
  border: '1px solid rgba(99,102,241,0.22)',
  borderRadius: 12,
  color: '#e2e8f0',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const Login = () => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const validate = () => {
    const e = {};
    if (!loginInput.trim()) e.login = 'Login is required';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(loginInput.trim(), password);
      message.success('Welcome back!');
      // Use hard redirect so AuthContext re-reads the token from localStorage
      // cleanly — avoids React state race condition with ProtectedRoute
      window.location.replace('/admin');
    } catch (err) {
      message.error(err.response?.data?.message || 'Invalid login or password');
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (name) => focused === name
    ? { border: '1px solid rgba(99,102,241,0.6)', boxShadow: '0 0 0 3px rgba(99,102,241,0.13)' }
    : {};

  const errorStyle = (field) => errors[field]
    ? { border: '1px solid rgba(239,68,68,0.5)' }
    : {};

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a14',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>

      {/* ── Ambient orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: 450, height: 450, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        <div style={{
          background: 'rgba(15,15,28,0.88)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 24,
          padding: '48px 40px 44px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          position: 'relative', overflow: 'hidden',
        }}>

          {/* Top shimmer line */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(6,182,212,0.4), transparent)',
          }} />

          {/* ── Logo ── */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 8px 32px rgba(99,102,241,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset',
              }}
            >
              <CodeOutlined style={{ color: '#fff', fontSize: 28 }} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              <h1 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.65rem', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                Admin
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                Sign in to manage your portfolio
              </p>
            </motion.div>
          </div>

          {/* ── Form ── */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            noValidate
          >
            {/* Login */}
            <Field label="Username / Login" error={errors.login}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#475569', fontSize: 15, pointerEvents: 'none', userSelect: 'none',
                }}>@</span>
                <input
                  type="text"
                  value={loginInput}
                  onChange={e => setLoginInput(e.target.value)}
                  onFocus={() => setFocused('login')}
                  onBlur={() => setFocused('')}
                  placeholder="your username or email"
                  autoComplete="username"
                  style={{ ...INPUT_BASE, paddingLeft: 36, paddingRight: 14, ...focusStyle('login'), ...errorStyle('login') }}
                />
              </div>
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#475569', fontSize: 14, pointerEvents: 'none',
                }}>🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  style={{ ...INPUT_BASE, paddingLeft: 36, paddingRight: 44, ...focusStyle('password'), ...errorStyle('password') }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', fontSize: 16, padding: 4, lineHeight: 1,
                    display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showPw ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </Field>

            {/* Submit */}
            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 52,
                  background: loading
                    ? 'rgba(99,102,241,0.45)'
                    : 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  border: 'none', borderRadius: 14,
                  color: '#fff', fontWeight: 700, fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(99,102,241,0.38)',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.38)'; }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRightOutlined /></>
                )}
              </button>
            </div>
          </motion.form>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            style={{ textAlign: 'center', color: '#1e293b', fontSize: '0.78rem', marginTop: 28, marginBottom: 0 }}
          >
            Protected area — authorised access only
          </motion.p>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Autofill dark override */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(10,10,20,0.95) inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
          caret-color: #e2e8f0;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
};

export default Login;
