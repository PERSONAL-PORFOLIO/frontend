import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '40px 24px', textAlign: 'center',
    }}>
      {/* Background orb */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: 'relative', maxWidth: 540 }}
      >
        {/* 404 number */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 150 }}
          style={{
            fontSize: 'clamp(6rem, 20vw, 10rem)',
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 8,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.05em',
          }}
        >
          404
        </motion.div>

        {/* AskTim logo as confused robot */}
        <motion.div
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginBottom: 28, display: 'inline-block' }}
        >
          <img src="/asktim-logo.svg" alt="AskTim" width={72} height={72}
            style={{ borderRadius: '50%', filter: 'drop-shadow(0 8px 20px rgba(99,102,241,0.4))' }} />
        </motion.div>

        <h1 style={{
          color: 'var(--color-heading)', fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em',
        }}>
          Page not found
        </h1>
        <p style={{
          color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.8,
          marginBottom: 36, maxWidth: 380, margin: '0 auto 36px',
        }}>
          Hmm, I looked everywhere and couldn't find that page.
          Maybe it was moved, deleted, or never existed.
        </p>

        {/* AskTim suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '10px 18px', borderRadius: 14, marginBottom: 32,
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <img src="/asktim-logo.svg" alt="AskTim" width={22} height={22} style={{ borderRadius: '50%' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Try asking <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>AskTim</span> — the chat button is bottom-right!
          </span>
        </motion.div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              height: 44, paddingInline: 22, borderRadius: 12, cursor: 'pointer',
              background: 'transparent', border: '1.5px solid rgba(99,102,241,0.35)',
              color: 'var(--color-heading)', fontWeight: 600, fontSize: '0.9rem',
              display: 'inline-flex', alignItems: 'center', gap: 7,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
          >
            <ArrowLeftOutlined /> Go back
          </button>
          <Link to="/">
            <button style={{
              height: 44, paddingInline: 22, borderRadius: 12, cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.9rem',
              display: 'inline-flex', alignItems: 'center', gap: 7,
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <HomeOutlined /> Go home
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
