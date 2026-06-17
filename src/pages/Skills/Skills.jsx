import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Spin, Result, Button, Empty } from 'antd';
import useFetch from '@/hooks/useFetch';
import { skillService } from '@/services/api';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Database', 'Mobile', 'DevOps', 'Other'];

const categoryColor = {
  Frontend: '#6366f1', Backend: '#06b6d4', Database: '#10b981',
  Mobile: '#f59e0b', DevOps: '#ef4444', Other: '#8b5cf6',
};

/* Animated progress bar that counts up on viewport entry */
const AnimatedBar = ({ level, color }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // small delay so animation is visible after card appears
          setTimeout(() => setWidth(level), 120);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [level]);

  return (
    <div ref={ref} style={{
      height: 6, borderRadius: 6,
      background: 'var(--color-border)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${width}%`,
        borderRadius: 6,
        background: `linear-gradient(90deg, ${color || '#6366f1'}, ${color ? color + 'aa' : '#06b6d4'})`,
        transition: 'width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: `0 0 10px ${color || '#6366f1'}66`,
      }} />
    </div>
  );
};

const Skills = () => {
  const { data: skills, loading, error, refetch } = useFetch(skillService.getAll);
  const [active, setActive] = useState('All');

  const filtered = skills?.filter(s => active === 'All' || s.category === active) || [];

  return (
    <div className="section">
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="section-eyebrow" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>What I Know</span>
        </div>
        <motion.h1 className="section-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          Skills &amp; Technologies
        </motion.h1>
        <p className="section-subtitle">The tools and technologies I work with daily</p>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
          {CATEGORIES.map(cat => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                style={{
                  padding: '8px 22px', borderRadius: 24, cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.88rem',
                  transition: 'all 0.25s ease',
                  background: isActive ? 'var(--gradient-primary)' : 'rgba(99,102,241,0.08)',
                  color: isActive ? 'white' : 'var(--color-text-muted)',
                  border: isActive ? 'none' : '1px solid rgba(99,102,241,0.2)',
                  boxShadow: isActive ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
        ) : error ? (
          <Result status="error" title="Failed to load skills" subTitle={error} extra={<Button type="primary" onClick={refetch}>Retry</Button>} />
        ) : !skills?.length ? (
          <Empty description={<span style={{ color: 'var(--color-text-muted)' }}>No skills added yet.</span>} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No skills in <strong style={{ color: 'var(--color-primary-light)' }}>{active}</strong>.</p>
            <Button type="link" onClick={() => setActive('All')} style={{ color: 'var(--color-primary-light)' }}>Show all</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map((skill, i) => {
              const color = categoryColor[skill.category] || '#6366f1';
              return (
                <motion.div
                  key={skill._id}
                  className="glow-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.45 }}
                  style={{ padding: 24 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 11,
                        background: `${color}18`,
                        border: `1px solid ${color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 19, color,
                        boxShadow: `0 0 12px ${color}22`,
                        overflow: 'hidden', flexShrink: 0,
                      }}>
                        {skill.iconUrl
                          ? <img src={skill.iconUrl} alt={skill.name} style={{ width: 26, height: 26, objectFit: 'contain' }} />
                          : (skill.icon || '⚡')
                        }
                      </div>
                      <div>
                        <div style={{ color: 'var(--color-heading)', fontWeight: 700, fontSize: '0.95rem' }}>{skill.name}</div>
                        <div style={{
                          fontSize: '0.72rem', fontWeight: 600,
                          color, textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {skill.category}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      color: 'var(--color-heading)', fontWeight: 800, fontSize: '1.1rem',
                      background: `${color}22`, border: `1px solid ${color}40`,
                      borderRadius: 8, padding: '2px 10px',
                    }}>
                      {skill.level}%
                    </span>
                  </div>
                  <AnimatedBar level={skill.level} color={color} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;
