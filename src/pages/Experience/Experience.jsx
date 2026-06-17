import React from 'react';
import { motion } from 'framer-motion';
import { Spin, Result, Button } from 'antd';
import { BankOutlined, CalendarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import useFetch from '@/hooks/useFetch';
import { experienceService } from '@/services/api';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';

const Experience = () => {
  const { data: experiences, loading, error, refetch } = useFetch(experienceService.getAll);

  return (
    <div className="section">
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="section-eyebrow" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>Work History</span>
        </div>
        <motion.h1 className="section-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          Experience
        </motion.h1>
        <p className="section-subtitle">My professional journey so far</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
        ) : error ? (
          <Result status="error" title="Failed to load" subTitle={error} extra={<Button type="primary" onClick={refetch}>Retry</Button>} />
        ) : !experiences?.length ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
            <ThunderboltOutlined style={{ fontSize: 48, color: 'var(--color-primary-light)', marginBottom: 16 }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No experience entries yet.</p>
          </motion.div>
        ) : (
          <div style={{ margin: '0 auto', position: 'relative' }}>
            {/* Vertical line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{
                position: 'absolute', left: 20, top: 20, bottom: 20, width: 2,
                background: 'linear-gradient(180deg, rgba(99,102,241,0.6) 0%, rgba(6,182,212,0.3) 100%)',
                borderRadius: 2,
                transformOrigin: 'top',
              }}
            />

            {experiences.map((exp, i) => (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                style={{ paddingLeft: 56, marginBottom: 32, position: 'relative' }}
              >
                {/* Timeline dot with pulse ring */}
                <div style={{ position: 'absolute', left: 9, top: 30, zIndex: 1 }}>
                  <motion.div
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                    style={{
                      position: 'absolute', inset: -6, borderRadius: '50%',
                      background: 'rgba(99,102,241,0.25)',
                    }}
                  />
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    boxShadow: '0 0 0 3px rgba(99,102,241,0.2), 0 0 16px rgba(99,102,241,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#fff',
                  }}>
                    ●
                  </div>
                </div>

                <div className="glow-card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                    <div>
                      <h3 style={{ color: 'var(--color-heading)', fontSize: '1.15rem', fontWeight: 700, marginBottom: 5 }}>{exp.position}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--color-primary-light)' }}>
                        <BankOutlined />
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{exp.company}</span>
                      </div>
                    </div>

                    {/* Date + Current badge grouped together */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span style={{
                        padding: '5px 14px', borderRadius: 20,
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                        color: 'var(--color-text-muted)', fontSize: '0.82rem',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <CalendarOutlined />
                        {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                      </span>
                      {!exp.endDate && (
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem',
                          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                          color: '#22c55e', fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                          Current
                        </span>
                      )}
                    </div>
                  </div>

                  {exp.description && (
                    <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: exp.technologies?.length ? 16 : 0 }}>
                      {exp.description}
                    </p>
                  )}

                  {exp.technologies?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 12, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                      {exp.technologies.map(t => <span key={t} className="tech-tag">{t}</span>)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Experience;
