import SEO from '@/components/SEO';
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Spin, Result, Button, Tag } from 'antd';
import {
  ArrowLeftOutlined, GithubOutlined, LinkOutlined,
  StarFilled, CalendarOutlined, CodeOutlined,
} from '@ant-design/icons';
import useFetch from '@/hooks/useFetch';
import { projectService } from '@/services/api';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #06b6d4)',
  'linear-gradient(135deg, #a855f7, #6366f1)',
  'linear-gradient(135deg, #06b6d4, #10b981)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #ef4444, #a855f7)',
];
const EMOJIS = ['🛠️', '🚀', '💡', '⚡', '🔥', '🌐'];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, loading, error } = useFetch(() => projectService.getOne(id), [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '120px 0' }}><Spin size="large" /></div>
  );

  if (error || !project) return (
    <div style={{ padding: '80px 0' }}>
      <Result status="404" title="Project not found"
        extra={<Button type="primary" onClick={() => navigate('/projects')}>Back to Projects</Button>} />
    </div>
  );

  const gradient = CARD_GRADIENTS[Math.abs(project._id.charCodeAt(0)) % CARD_GRADIENTS.length];
  const emoji = EMOJIS[Math.abs(project._id.charCodeAt(1)) % EMOJIS.length];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;

  return (
    <div className="section">
      <SEO
        title={project.title}
        description={project.description ? project.description.slice(0, 160) : `Details about ${project.title}`}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <div className="section-inner">

        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: '0.88rem',
              marginBottom: 36, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; e.currentTarget.style.color = 'var(--color-primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          >
            <ArrowLeftOutlined /> Back to Projects
          </button>
        </motion.div>

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            borderRadius: 20, overflow: 'hidden',
            border: '1px solid rgba(99,102,241,0.15)',
            marginBottom: 40,
            boxShadow: '0 8px 40px rgba(99,102,241,0.12)',
          }}
        >
          {/* Gradient top strip */}
          <div style={{ height: 6, background: gradient }} />

          <div style={{
            padding: '32px 36px',
            background: 'var(--bg-card)',
            display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap',
          }}>
            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 18, flexShrink: 0,
              background: project.logo ? 'var(--bg-secondary)' : gradient,
              border: project.logo ? '1px solid rgba(99,102,241,0.2)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
            }}>
              {project.logo
                ? <img src={project.logo} alt={project.title} style={{ width: 50, height: 50, objectFit: 'contain' }} />
                : emoji}
            </div>

            {/* Title area */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <h1 style={{ color: 'var(--color-heading)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, margin: 0 }}>
                  {project.title}
                </h1>
                {project.featured && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem',
                    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)',
                    color: '#f59e0b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    <StarFilled style={{ fontSize: 10 }} /> Featured
                  </span>
                )}
              </div>
              {(project.startDate || project.endDate) && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <CalendarOutlined />
                  {formatDate(project.startDate)}{project.endDate ? ` — ${formatDate(project.endDate)}` : ' — Present'}
                </div>
              )}
              {/* Action links */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <button style={{
                      height: 38, paddingInline: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: gradient, color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 4px 14px rgba(99,102,241,0.35)', transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <LinkOutlined /> Live Demo
                    </button>
                  </a>
                )}
                {project.demoUrl && !project.liveUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <button style={{
                      height: 38, paddingInline: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: gradient, color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 4px 14px rgba(99,102,241,0.35)', transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <LinkOutlined /> Live Demo
                    </button>
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <button style={{
                      height: 38, paddingInline: 20, borderRadius: 10, cursor: 'pointer',
                      background: 'transparent', border: '1.5px solid rgba(99,102,241,0.35)',
                      color: 'var(--color-heading)', fontWeight: 600, fontSize: '0.85rem',
                      display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
                    >
                      <GithubOutlined /> View Code
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start', flexWrap: 'wrap' }}>
          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
            <div style={{
              padding: '28px 32px', borderRadius: 16,
              background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.12)',
              marginBottom: 24,
            }}>
              <h2 style={{ color: 'var(--color-heading)', fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                About this project
              </h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.9, fontSize: '0.95rem', whiteSpace: 'pre-wrap', margin: 0 }}>
                {project.description || 'No description provided.'}
              </p>
            </div>

            {/* Tech stack */}
            {project.technologies?.length > 0 && (
              <div style={{
                padding: '24px 32px', borderRadius: 16,
                background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.12)',
              }}>
                <h2 style={{ color: 'var(--color-heading)', fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CodeOutlined style={{ color: 'var(--color-primary-light)' }} /> Tech Stack
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.technologies.map(tech => (
                    <Link key={tech} to={`/projects?tech=${encodeURIComponent(tech)}`}>
                      <span className="tech-tag" style={{ cursor: 'pointer', fontSize: '0.88rem', padding: '6px 16px' }}>
                        {tech}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Other projects CTA */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: 60, paddingTop: 40, borderTop: '1px solid rgba(99,102,241,0.1)' }}
        >
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>Want to see more?</p>
          <Link to="/projects">
            <button style={{
              padding: '11px 28px', borderRadius: 12, cursor: 'pointer',
              background: gradient, border: 'none', color: '#fff',
              fontWeight: 600, fontSize: '0.92rem',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              View All Projects
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default ProjectDetail;
