import React from 'react';
import { motion } from 'framer-motion';
import { Spin, Result, Button } from 'antd';
import { BookOutlined, CalendarOutlined } from '@ant-design/icons';
import useFetch from '@/hooks/useFetch';
import { educationService } from '@/services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';

const Education = () => {
  const { data: educations, loading, error, refetch } = useFetch(educationService.getAll);

  return (
    <div className="section">
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="section-eyebrow" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>Academic</span>
        </div>
        <motion.h1 className="section-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Education</motion.h1>
        <p className="section-subtitle">My academic background</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
        ) : error ? (
          <Result
            status="error"
            title="Failed to load"
            subTitle={error}
            extra={<Button type="primary" onClick={refetch}>Retry</Button>}
          />
        ) : !educations?.length ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
            <BookOutlined style={{ fontSize: 48, color: 'var(--color-primary-light)', marginBottom: 16 }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No education entries yet.</p>
          </motion.div>
        ) : (
          <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {educations.map((edu, i) => (
              <motion.div
                key={edu._id}
                className="glow-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>
                  <BookOutlined style={{ color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'var(--color-heading)', fontWeight: 700, fontSize: '1.15rem', marginBottom: 4 }}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </h3>
                  <p style={{ color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: 8 }}>{edu.school}</p>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined /> {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                  </span>
                  {edu.description && (
                    <p style={{ color: 'var(--color-text-muted)', marginTop: 12, lineHeight: 1.7, fontSize: '0.95rem' }}>{edu.description}</p>
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

export default Education;
