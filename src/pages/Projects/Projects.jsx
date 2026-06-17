import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spin, Result, Button, Empty } from 'antd';
import { GithubOutlined, LinkOutlined, StarFilled } from '@ant-design/icons';
import useFetch from '@/hooks/useFetch';
import { projectService } from '@/services/api';

/* Gradient palette per card index */
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #06b6d4)',
  'linear-gradient(135deg, #a855f7, #6366f1)',
  'linear-gradient(135deg, #06b6d4, #10b981)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #ef4444, #a855f7)',
];
const EMOJIS = ['🛠️', '🚀', '💡', '⚡', '🔥', '🌐'];

const Projects = () => {
  const { data: projects, loading, error, refetch } = useFetch(projectService.getAll);
  const [activeTech, setActiveTech] = useState('All');

  const allTechs = useMemo(() => {
    const set = new Set(['All']);
    projects?.forEach(p => p.technologies?.forEach(t => set.add(t)));
    return [...set];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (activeTech === 'All') return projects;
    return projects.filter(p => p.technologies?.includes(activeTech));
  }, [projects, activeTech]);

  return (
    <div className="section">
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="section-eyebrow" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>Portfolio</span>
        </div>
        <motion.h1 className="section-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          Projects
        </motion.h1>
        <p className="section-subtitle">Things I&apos;ve built — click a tag to filter</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
        ) : error ? (
          <Result status="error" title="Failed to load projects" subTitle={error} extra={<Button type="primary" onClick={refetch}>Retry</Button>} />
        ) : !projects?.length ? (
          <Empty description={<span style={{ color: 'var(--color-text-muted)' }}>No projects yet. Check back soon!</span>} />
        ) : (
          <>
            {/* Tech filter */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}
            >
              {allTechs.map(tech => {
                const isActive = activeTech === tech;
                return (
                  <button
                    key={tech}
                    onClick={() => setActiveTech(tech)}
                    style={{
                      padding: '7px 18px', borderRadius: 20, cursor: 'pointer',
                      fontWeight: 500, fontSize: '0.84rem', transition: 'all 0.25s ease',
                      background: isActive ? 'var(--gradient-primary)' : 'rgba(99,102,241,0.08)',
                      color: isActive ? 'white' : 'var(--color-text-muted)',
                      border: isActive ? 'none' : '1px solid rgba(99,102,241,0.18)',
                      boxShadow: isActive ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                    }}
                  >
                    {tech}
                  </button>
                );
              })}
            </motion.div>

            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  No projects match <strong style={{ color: 'var(--color-primary-light)' }}>{activeTech}</strong>.
                </p>
                <Button type="link" onClick={() => setActiveTech('All')} style={{ color: 'var(--color-primary-light)' }}>Show all</Button>
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((project, i) => (
                    <motion.div
                      key={project._id}
                      className="glow-card"
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ delay: i * 0.06, duration: 0.45 }}
                      style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    >
                      {/* Coloured top bar */}
                      <div style={{
                        height: 5,
                        background: CARD_GRADIENTS[i % CARD_GRADIENTS.length],
                        flexShrink: 0,
                      }} />

                      <div style={{ padding: '24px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div style={{
                            width: 50, height: 50, borderRadius: 13, flexShrink: 0,
                            background: project.logo ? 'var(--bg-card)' : CARD_GRADIENTS[i % CARD_GRADIENTS.length],
                            border: project.logo ? '1px solid rgba(99,102,241,0.2)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, overflow: 'hidden',
                            boxShadow: '0 6px 20px rgba(99,102,241,0.25)',
                          }}>
                            {project.logo
                              ? <img src={project.logo} alt={project.title} style={{ width: 34, height: 34, objectFit: 'contain' }} />
                              : EMOJIS[i % EMOJIS.length]
                            }
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {project.featured && (
                              <span style={{
                                padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem',
                                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)',
                                color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                              }}>
                                <StarFilled style={{ fontSize: 10 }} /> Featured
                              </span>
                            )}
                            {project.githubUrl && (
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: 9, cursor: 'pointer',
                                  background: 'var(--bg-card)', border: '1px solid var(--color-border)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'var(--color-text-muted)', fontSize: 14,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-heading)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                >
                                  <GithubOutlined />
                                </div>
                              </a>
                            )}
                            {project.demoUrl && (
                              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: 9, cursor: 'pointer',
                                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'var(--color-primary-light)', fontSize: 14,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.22)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; }}
                                >
                                  <LinkOutlined />
                                </div>
                              </a>
                            )}
                          </div>
                        </div>

                        <h3 style={{ color: 'var(--color-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{project.title}</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.75, flex: 1 }}>{project.description}</p>

                        {project.technologies?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                            {project.technologies.map(t => (
                              <span
                                key={t}
                                className="tech-tag"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setActiveTech(t)}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;
