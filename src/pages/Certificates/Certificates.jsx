import React from 'react';
import { motion } from 'framer-motion';
import { Spin, Button, Image, Result } from 'antd';
import { SafetyCertificateOutlined, LinkOutlined, CalendarOutlined, FilePdfOutlined } from '@ant-design/icons';
import useFetch from '@/hooks/useFetch';
import { certificateService } from '@/services/api';

const Certificates = () => {
  const { data: certificates, loading, error, refetch } = useFetch(certificateService.getAll);

  return (
    <div className="section">
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="section-eyebrow" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>Achievements</span>
        </div>
        <motion.h1 className="section-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Certificates</motion.h1>
        <p className="section-subtitle">Credentials and professional achievements</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
        ) : error ? (
          <Result status="error" title="Failed to load certificates" subTitle={error} extra={<Button type="primary" onClick={refetch}>Retry</Button>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {certificates?.map((cert, i) => (
              <motion.div
                key={cert._id}
                className="glow-card"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {/* Certificate file — image or PDF */}
                {cert.image ? (
                  cert.image.toLowerCase().endsWith('.pdf') ? (
                    <a href={cert.image} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div style={{
                        width: '100%', height: 120,
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))',
                        borderBottom: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))'}
                      onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))'}
                      >
                        <FilePdfOutlined style={{ fontSize: 36, color: '#ef4444' }} />
                        <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>VIEW PDF CERTIFICATE</span>
                      </div>
                    </a>
                  ) : (
                    <div style={{ width: '100%', height: 160, overflow: 'hidden' }}>
                      <Image
                        src={cert.image}
                        alt={cert.title}
                        style={{ width: '100%', height: 160, objectFit: 'cover' }}
                        preview={{ mask: <span style={{ fontSize: '0.85rem' }}>View</span> }}
                      />
                    </div>
                  )
                ) : (
                  <div style={{
                    width: '100%', height: 100,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SafetyCertificateOutlined style={{ fontSize: 40, color: 'rgba(99,102,241,0.5)' }} />
                  </div>
                )}

                <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ color: 'var(--color-heading)', fontWeight: 700, flex: 1 }}>{cert.title}</h3>
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="small" icon={<LinkOutlined />}
                          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--color-primary-light)', flexShrink: 0 }}>
                          Verify
                        </Button>
                      </a>
                    )}
                  </div>

                  <p style={{ color: 'var(--color-primary-light)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 'auto' }}>{cert.issuer}</p>

                  {cert.issueDate && (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 5, marginTop: 12 }}>
                      <CalendarOutlined />
                      {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {(!certificates || certificates.length === 0) && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px 0' }}>
                <SafetyCertificateOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }} />
                <p>No certificates added yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
