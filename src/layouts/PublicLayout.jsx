import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuOutlined, CloseOutlined, CodeOutlined } from '@ant-design/icons';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import { analyticsService, profileService } from '../services/api';
import useFetch from '../hooks/useFetch';
import AIChatWidget from '../components/AIChatWidget';

/* ── Tiny inline SVG icons ── */
const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const GithubSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.42-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.29c0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);
const LinkedinSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const TwitterSVG = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const MailSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const socialIconBase = {
  width: 36, height: 36, borderRadius: 8,
  background: 'rgba(99,102,241,0.08)',
  border: '1px solid rgba(99,102,241,0.18)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--color-text-muted)',
  textDecoration: 'none', transition: 'all 0.2s',
};

const ALL_NAV_LINKS = [
  { path: '/', label: 'Home', key: null },
  { path: '/about', label: 'About', key: 'about' },
  { path: '/skills', label: 'Skills', key: 'skills' },
  { path: '/experience', label: 'Experience', key: 'experience' },
  { path: '/projects', label: 'Projects', key: 'projects' },
  { path: '/education', label: 'Education', key: 'education' },
  { path: '/certificates', label: 'Certs', key: 'certificates' },
  { path: '/blog', label: 'Blog', key: 'blog' },
  { path: '/contact', label: 'Contact', key: 'contact' },
];

const PublicLayout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const location = useLocation();
  const { settings } = useSiteSettings();
  const { isDark, toggle } = useTheme();
  const { data: profile } = useFetch(profileService.get);

  // ── Google Analytics ──
  useEffect(() => {
    const gaId = settings?.googleAnalyticsId?.trim();
    if (!gaId || document.getElementById('ga-script')) return;
    const s1 = document.createElement('script');
    s1.id = 'ga-script'; s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(s1);
    const s2 = document.createElement('script');
    s2.id = 'ga-init';
    s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});`;
    document.head.appendChild(s2);
  }, [settings?.googleAnalyticsId]);

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', { page_path: location.pathname });
  }, [location.pathname]);

  useEffect(() => {
    analyticsService.track(location.pathname).catch(() => {});
  }, [location.pathname]);

  const navLinks = ALL_NAV_LINKS.filter(
    link => link.key === null || settings.navVisibility?.[link.key] !== false,
  );

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollPct(total > 0 ? (y / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (settings.maintenanceMode) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24, textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🔧</div>
          <h1 style={{ color: 'var(--color-heading)', fontWeight: 900, fontSize: '2rem', marginBottom: 12 }}>Under Maintenance</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: 440, margin: '0 auto' }}>
            {settings.maintenanceMessage || 'We\'re making improvements. Check back soon!'}
          </p>
          <p style={{ marginTop: 24, color: 'rgba(99,102,241,0.5)', fontSize: '0.8rem' }}>
            Are you the admin? <a href="/admin/login" style={{ color: 'var(--color-primary-light)' }}>Sign in here</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <div className="scroll-progress" style={{ width: `${scrollPct}%` }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? '12px 0' : '20px 0',
        background: scrolled ? 'var(--bg-nav-scrolled)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              <CodeOutlined style={{ color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-heading)' }}>
              {profile?.fullName || 'Tim Bin'}
            </span>
          </NavLink>

          {/* Desktop Nav + theme toggle */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
            {navLinks.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                style={({ isActive }) => ({
                  padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
                  fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s',
                  color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                })}
              >
                {label}
              </NavLink>
            ))}
            <button className="theme-toggle" onClick={toggle} title={isDark ? 'Light mode' : 'Dark mode'} style={{ marginLeft: 8 }}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Mobile: theme + hamburger */}
          <div style={{ display: 'none', alignItems: 'center', gap: 8 }} className="mobile-right">
            <button className="theme-toggle" onClick={toggle}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.18)',
                borderRadius: 8, width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-heading)', fontSize: 17, cursor: 'pointer',
              }}
            >
              <MenuOutlined />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mob-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 1100,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
              }}
            />

            {/* Panel */}
            <motion.div
              key="mob-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 'min(80vw, 300px)',
                zIndex: 1200,
                background: isDark
                  ? 'rgba(8,8,20,0.97)'
                  : 'rgba(248,249,255,0.98)',
                backdropFilter: 'blur(32px)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Ambient orb */}
              <div style={{
                position: 'absolute', top: -60, right: -60,
                width: 220, height: 220, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
                filter: 'blur(30px)', pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', bottom: 40, left: -40,
                width: 160, height: 160, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
                filter: 'blur(24px)', pointerEvents: 'none',
              }} />

              {/* Left accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: 2,
                background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.6), rgba(6,182,212,0.4), transparent)',
              }} />

              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '24px 24px 20px',
                borderBottom: '1px solid rgba(99,102,241,0.1)',
                position: 'relative', zIndex: 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CodeOutlined style={{ color: '#fff', fontSize: 14 }} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-heading)' }}>
                    {profile?.fullName || 'Tim Bin'}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 8, width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--color-text-muted)',
                    fontSize: 16,
                  }}
                >
                  <CloseOutlined />
                </motion.button>
              </div>

              {/* Nav links */}
              <nav style={{ flex: 1, padding: '28px 24px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
                <motion.div
                  variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  {navLinks.map(({ path, label }) => (
                    <motion.div
                      key={path}
                      variants={{
                        hidden: { opacity: 0, x: 28 },
                        show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
                      }}
                    >
                      <NavLink
                        to={path}
                        end={path === '/'}
                        onClick={() => setMobileOpen(false)}
                        style={({ isActive }) => ({
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '13px 14px', borderRadius: 12,
                          textDecoration: 'none',
                          background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                          border: isActive ? '1px solid rgba(99,102,241,0.22)' : '1px solid transparent',
                          transition: 'all 0.18s',
                          position: 'relative', overflow: 'hidden',
                        })}
                      >
                        {({ isActive }) => (
                          <>
                            {/* Label */}
                            <span style={{
                              fontSize: '0.97rem', fontWeight: isActive ? 700 : 500,
                              color: isActive ? 'var(--color-heading)' : 'var(--color-text-muted)',
                              flex: 1,
                            }}>
                              {label}
                            </span>

                            {/* Active dot */}
                            {isActive && (
                              <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                                boxShadow: '0 0 6px rgba(99,102,241,0.6)',
                              }} />
                            )}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  ))}
                </motion.div>
              </nav>

              {/* Footer: social + theme */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{
                  padding: '20px 24px 28px',
                  borderTop: '1px solid rgba(99,102,241,0.1)',
                  position: 'relative', zIndex: 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {profile?.githubUrl && (
                      <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                        style={{ ...socialIconBase, width: 34, height: 34, borderRadius: 8 }}>
                        <GithubSVG />
                      </a>
                    )}
                    {profile?.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        style={{ ...socialIconBase, width: 34, height: 34, borderRadius: 8 }}>
                        <LinkedinSVG />
                      </a>
                    )}
                    {profile?.twitterUrl && (
                      <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer"
                        style={{ ...socialIconBase, width: 34, height: 34, borderRadius: 8 }}>
                        <TwitterSVG />
                      </a>
                    )}
                  </div>
                  <button className="theme-toggle" onClick={toggle} title={isDark ? 'Light mode' : 'Dark mode'}>
                    {isDark ? <SunIcon /> : <MoonIcon />}
                  </button>
                </div>
                <p style={{ margin: '12px 0 0', fontSize: '0.72rem', color: 'rgba(99,102,241,0.35)', fontFamily: 'monospace' }}>
                  © {new Date().getFullYear()} {profile?.fullName || 'Tim Bin'}
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page content ── */}
      <main style={{ flex: 1, paddingTop: 80 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      {settings.showFooter !== false && (
        <footer style={{
          borderTop: '1px solid var(--color-border)',
          background: isDark ? 'rgba(10,10,18,0.6)' : 'rgba(245,247,255,0.85)',
          backdropFilter: 'blur(10px)',
          padding: '40px 24px 28px',
          marginTop: 'auto',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
              {/* Brand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                }}>
                  <CodeOutlined style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ color: 'var(--color-heading)', fontWeight: 700, fontSize: '0.95rem' }}>
                    {profile?.fullName || 'Tim Bin'}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                    {profile?.title || 'Software Engineer'}
                  </div>
                </div>
              </div>

              {/* Social icons from profile */}
              <div style={{ display: 'flex', gap: 10 }}>
                {profile?.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub"
                    style={{ ...socialIconBase }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.color = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)'; e.currentTarget.style.transform = ''; }}>
                    <GithubSVG />
                  </a>
                )}
                {profile?.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                    style={{ ...socialIconBase }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.color = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)'; e.currentTarget.style.transform = ''; }}>
                    <LinkedinSVG />
                  </a>
                )}
                {profile?.twitterUrl && (
                  <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" title="Twitter/X"
                    style={{ ...socialIconBase }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.color = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)'; e.currentTarget.style.transform = ''; }}>
                    <TwitterSVG />
                  </a>
                )}
                <a href="/contact" title="Contact"
                  style={{ ...socialIconBase }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.color = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)'; e.currentTarget.style.transform = ''; }}>
                  <MailSVG />
                </a>
              </div>
            </div>

            <div style={{ marginTop: 28, paddingTop: 20, textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: 0 }}>
                {settings.footerText || `© ${new Date().getFullYear()} Tim Bin. All rights reserved.`}
              </p>
            </div>
          </div>
        </footer>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav  { display: none !important; }
          .mobile-right { display: flex !important; }
        }
      `}</style>

      {/* ── AI Chat Widget ── */}
      <AIChatWidget />
    </div>
  );
};

export default PublicLayout;
