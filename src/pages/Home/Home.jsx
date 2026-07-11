import SEO from '@/components/SEO';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Spin } from 'antd';
import {
  GithubOutlined, LinkedinOutlined, DownloadOutlined,
  ArrowRightOutlined, MailOutlined, UserOutlined,
  RocketOutlined, TrophyOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { Avatar } from 'antd';
import useFetch from '@/hooks/useFetch';
import { profileService, projectService, skillService, experienceService } from '@/services/api';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

function useTypewriter(words, typingSpeed = 80, deletingSpeed = 45, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState('typing'); // 'typing' | 'pausing' | 'deleting'
  const timerRef = useRef(null);

  useEffect(() => {
    const word = words[wordIdx % words.length];

    if (phase === 'typing') {
      if (display.length < word.length) {
        timerRef.current = setTimeout(() => setDisplay(word.slice(0, display.length + 1)), typingSpeed);
      } else {
        timerRef.current = setTimeout(() => setPhase('pausing'), pause);
      }
    } else if (phase === 'pausing') {
      timerRef.current = setTimeout(() => setPhase('deleting'), 300);
    } else {
      if (display.length > 0) {
        timerRef.current = setTimeout(() => setDisplay(d => d.slice(0, -1)), deletingSpeed);
      } else {
        setWordIdx(i => i + 1);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [display, phase, wordIdx, words, typingSpeed, deletingSpeed, pause]);

  return display;
}

/* ── Years of experience helper ─────────────── */
const calcYearsExperience = (experiences = []) => {
  if (!experiences.length) return null;
  const earliest = experiences.reduce((min, exp) => {
    const start = new Date(exp.startDate || exp.from || exp.start || 0);
    return start < min ? start : min;
  }, new Date());
  const years = Math.floor((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 365));
  return years > 0 ? years : null;
};

/* ── Fade-up motion preset ─────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

/* ── Dot grid background ───────────────────── */
const DotGrid = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
  }}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(99,102,241,0.18)" />
        </pattern>
        <radialGradient id="dotFade" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="dotMask">
          <rect width="100%" height="100%" fill="url(#dotFade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" mask="url(#dotMask)" />
    </svg>
  </div>
);

/* ═══════════════════════════════════════════ */
const Home = () => {
  const { settings } = useSiteSettings();
  const roles = settings.typingRoles?.length ? settings.typingRoles : ['Software Enginneer'];
  const role = useTypewriter(roles);
  const { data: profile, loading } = useFetch(profileService.get);
  const { data: projects } = useFetch(() => projectService.getAll({ featured: true }));
  const { data: skills } = useFetch(skillService.getAll);
  const { data: allProjects } = useFetch(projectService.getAll);
  const { data: experiences } = useFetch(experienceService.getAll);

  const topSkills = skills?.slice(0, 8) || [];
  const featuredProjects = projects?.slice(0, 3) || [];

  // Build stats from real data — only include a stat if there's actual data
  const yearsExp = calcYearsExperience(experiences || []);
  const STATS = [
    allProjects?.length && { icon: <RocketOutlined />, label: 'Projects Built', value: allProjects.length, suffix: '+', color: '#6366f1' },
    skills?.length && { icon: <ThunderboltOutlined />, label: 'Technologies', value: skills.length, suffix: '+', color: '#06b6d4' },
    yearsExp && { icon: <TrophyOutlined />, label: 'Years Experience', value: yearsExp, suffix: '+', color: '#a855f7' },
  ].filter(Boolean);

  const seoDescription = profile?.summary
    ? profile.summary.slice(0, 160)
    : `${profile?.fullName || 'Tim'}'s software engineering portfolio — skills, projects, experience and more.`;

  return (
    <div>
      <SEO
        pageKey="home"
        title={profile?.fullName ? `${profile.fullName} — Software Engineer` : undefined}
        description={seoDescription || undefined}
      />
      {/* ─── HERO ─────────────────────────────── */}
      <section style={{
        minHeight: '95vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot grid */}
        <DotGrid />

        {/* Orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '8%', right: '8%',
              width: 420, height: 420, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 0.9, 1] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            style={{
              position: 'absolute', bottom: '15%', left: '2%',
              width: 320, height: 320, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }}
          />
          <motion.div
            animate={{ x: [0, 20, -20, 0], y: [0, -20, 10, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            style={{
              position: 'absolute', top: '50%', right: '25%',
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        {/* Hero content */}
        <div className="section-inner" style={{ width: '100%', position: 'relative', zIndex: 1, paddingTop: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
          ) : (
            <div style={{ maxWidth: 820, display: 'flex', gap: 56, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Avatar */}
              {profile?.avatar && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ flexShrink: 0 }}
                >
                  <div style={{ position: 'relative', animation: 'float 6s ease-in-out infinite' }}>
                    {/* Spinning gradient ring */}
                    <div style={{
                      position: 'absolute', inset: -6, borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, #6366f1, #06b6d4, #a855f7, #6366f1)',
                      animation: 'spin-slow 6s linear infinite',
                      filter: 'blur(2px)',
                    }} />
                    <div style={{
                      position: 'absolute', inset: -2, borderRadius: '50%',
                      background: 'var(--bg-primary)',
                    }} />
                    <Avatar
                      size={190}
                      src={profile.avatar}
                      icon={<UserOutlined />}
                      style={{ position: 'relative', zIndex: 1, border: 'none' }}
                    />
                    {/* Online indicator */}
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        position: 'absolute', bottom: 14, right: 14, zIndex: 2,
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#22c55e', border: '3px solid var(--bg-primary)',
                        boxShadow: '0 0 10px rgba(34,197,94,0.6)',
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Text */}
              <div style={{ flex: 1, minWidth: 280 }}>
                <motion.div {...fadeUp(0)}>
                  {settings.availableForWork !== false ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '6px 14px', borderRadius: 999,
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: '#16a34a', fontWeight: 600, fontSize: '0.82rem',
                      letterSpacing: '0.02em', marginBottom: 18,
                    }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                        display: 'inline-block', flexShrink: 0,
                        animation: 'afw-ping 1.8s cubic-bezier(0,0,0.2,1) infinite',
                      }} />
                      {settings.heroBadge || 'Available for work'}
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '6px 14px', borderRadius: 999,
                      background: 'rgba(156,163,175,0.1)',
                      border: '1px solid rgba(156,163,175,0.25)',
                      color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.82rem',
                      letterSpacing: '0.02em', marginBottom: 18,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9ca3af', display: 'inline-block', flexShrink: 0 }} />
                      Not available right now
                    </span>
                  )}
                </motion.div>

                <motion.h1 {...fadeUp(0.1)} style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  marginBottom: 16,
                  color: 'var(--color-heading)',
                  letterSpacing: '-0.03em',
                }}>
                  Hi, I&apos;m{' '}
                  <span className="gradient-text">{profile?.fullName || 'Tim Bin'}</span>
                </motion.h1>

                {/* Typewriter role */}
                <motion.h2 {...fadeUp(0.15)} style={{
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.65rem)',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  marginBottom: 24,
                  minHeight: '2.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}>
                  <span style={{ color: 'var(--color-primary-light)' }}>&gt;</span>
                  &nbsp;
                  <span style={{ color: 'var(--color-text)' }}>{role}</span>
                  <span className="typing-cursor" />
                </motion.h2>

                <motion.p {...fadeUp(0.22)} style={{
                  fontSize: '1rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.85,
                  maxWidth: 560,
                  marginBottom: 40,
                }}>
                  {profile?.summary || 'Passionate developer building modern, scalable web applications with React, Node.js, and cloud technologies. Let\'s create something amazing together.'}
                </motion.p>

                <motion.div {...fadeUp(0.3)} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link to="/contact">
                    <button style={{
                      height: 50, paddingInline: 30,
                      fontWeight: 700, fontSize: '0.95rem',
                      background: 'var(--gradient-primary)',
                      border: 'none', borderRadius: 14, color: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.55)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.4)'; }}
                    >
                      <MailOutlined /> Hire Me
                    </button>
                  </Link>

                  {profile?.resumeUrl && (
                    <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <button style={{
                        height: 50, paddingInline: 28,
                        fontWeight: 600, fontSize: '0.95rem',
                        background: 'transparent',
                        border: '1.5px solid rgba(99,102,241,0.45)',
                        borderRadius: 14, color: 'var(--color-heading)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <DownloadOutlined /> Download CV
                      </button>
                    </a>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginLeft: 4 }}>
                    {profile?.githubUrl && (
                      <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                        <div style={{
                          width: 46, height: 46, borderRadius: 12,
                          background: 'var(--bg-card)',
                          border: '1px solid var(--color-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--color-heading)', fontSize: 18, cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = ''; }}
                        >
                          <GithubOutlined />
                        </div>
                      </a>
                    )}
                    {profile?.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <div style={{
                          width: 46, height: 46, borderRadius: 12,
                          background: 'rgba(10,102,194,0.15)',
                          border: '1px solid rgba(10,102,194,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#0a66c2', fontSize: 18, cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(10,102,194,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,102,194,0.15)'; e.currentTarget.style.transform = ''; }}
                        >
                          <LinkedinOutlined />
                        </div>
                      </a>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll chevron — desktop only */}
        <motion.div
          className="scroll-chevron"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── STATS — only render if there's at least one real stat ── */}
      {STATS.length > 0 && <section style={{
        padding: '60px 0',
        borderTop: '1px solid rgba(99,102,241,0.08)',
        borderBottom: '1px solid rgba(99,102,241,0.08)',
        background: 'rgba(99,102,241,0.02)',
      }}>
        <div className="section-inner">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {STATS.map(({ icon, label, value, suffix, color }, i) => (
              <motion.div
                key={label}
                className="stat-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px',
                  background: `${color}18`, border: `1px solid ${color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color,
                }}>
                  {icon}
                </div>
                <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--color-heading)', lineHeight: 1 }}>
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 6, fontWeight: 500 }}>{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>}

      {/* ─── TECH STACK ───────────────────────── */}
      {topSkills.length > 0 && (
        <section style={{ padding: '72px 0' }}>
          <div className="section-inner">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 28 }}
            >
              — Tech Stack —
            </motion.p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {topSkills.map((skill, i) => (
                <motion.span
                  key={skill._id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
                  className="tech-tag"
                  style={{ fontSize: '0.88rem', padding: '7px 18px', cursor: 'default' }}
                >
                  {skill.icon && <span style={{ marginRight: 6 }}>{skill.icon}</span>}
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FEATURED PROJECTS ────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="section" style={{ background: 'rgba(99,102,241,0.02)', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
          <div className="section-inner">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span className="section-eyebrow" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>Featured Work</span>
            </div>
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Things I&apos;ve Built
            </motion.h2>
            <p className="section-subtitle">A selection of recent projects</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {featuredProjects.map((project, i) => (
                <motion.div
                  key={project._id}
                  className="glow-card"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.55 }}
                  style={{ padding: 28 }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: [
                        'var(--gradient-primary)',
                        'var(--gradient-purple)',
                        'var(--gradient-teal)',
                      ][i % 3],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 18, fontSize: 22,
                      boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                    }}>
                      {['🚀', '💡', '⚡'][i % 3]}
                    </div>
                    <h3 style={{ color: 'var(--color-heading)', fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>{project.title}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.75 }}>{project.description}</p>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 18 }}>
                    {project.technologies?.slice(0, 4).map(t => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ textAlign: 'center', marginTop: 52 }}
            >
              <Link to="/projects">
                <button style={{
                  padding: '12px 32px', borderRadius: 12, border: '1.5px solid rgba(99,102,241,0.4)',
                  background: 'transparent', color: 'var(--color-primary-light)',
                  fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = ''; }}
                >
                  View All Projects <ArrowRightOutlined />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── CTA BANNER ───────────────────────── */}
      <section style={{ padding: '100px 0' }}>
        <div className="section-inner">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              textAlign: 'center',
              padding: '72px 40px',
              borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background glow */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500, height: 300,
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }} />

            <span className="section-eyebrow" style={{ margin: '0 auto 24px', display: 'inline-flex' }}>
              {settings.heroBadge || 'Open to Opportunities'}
            </span>
            <h2 style={{ color: 'var(--color-heading)', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 16, letterSpacing: '-0.02em', position: 'relative' }}>
              <span className="gradient-text">{settings.ctaHeading || 'Let\'s Build Something Amazing Together'}</span>
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.8, position: 'relative' }}>
              {settings.ctaSubtext || 'I\'m currently open to freelance projects and full-time roles. Let\'s discuss how I can add value to your team.'}
            </p>
            <Link to="/contact" style={{ position: 'relative' }}>
              <button style={{
                height: 52, paddingInline: 36,
                fontWeight: 700, fontSize: '1rem',
                background: 'var(--gradient-primary)',
                border: 'none', borderRadius: 14, color: '#fff',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10,
                boxShadow: '0 4px 30px rgba(99,102,241,0.5)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.65)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 30px rgba(99,102,241,0.5)'; }}
              >
                <MailOutlined /> Get In Touch
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
      <style>{`
        @media (max-width: 768px) {
          .scroll-chevron { display: none !important; }
        }
        @keyframes afw-ping {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
          70%  { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
};

export default Home;
