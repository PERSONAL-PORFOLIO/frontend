import SEO from '@/components/SEO';
import React from 'react';
import { motion } from 'framer-motion';
import { Row, Col, Spin, Avatar, Tooltip, Result, Button } from 'antd';
import {
  EnvironmentOutlined, MailOutlined, GithubOutlined, LinkedinOutlined,
  PhoneOutlined, TwitterOutlined, FacebookOutlined, InstagramOutlined,
  YoutubeOutlined, GlobalOutlined, UserOutlined,
} from '@ant-design/icons';
import useFetch from '@/hooks/useFetch';
import { profileService } from '@/services/api';

const SOCIAL_MAP = [
  { key: 'githubUrl', icon: <GithubOutlined />, label: 'GitHub', color: '#ffffff' },
  { key: 'linkedinUrl', icon: <LinkedinOutlined />, label: 'LinkedIn', color: '#0a66c2' },
  { key: 'twitterUrl', icon: <TwitterOutlined />, label: 'Twitter/X', color: '#1d9bf0' },
  { key: 'facebookUrl', icon: <FacebookOutlined />, label: 'Facebook', color: '#1877f2' },
  { key: 'instagramUrl', icon: <InstagramOutlined />, label: 'Instagram', color: '#e1306c' },
  { key: 'youtubeUrl', icon: <YoutubeOutlined />, label: 'YouTube', color: '#ff0000' },
  { key: 'websiteUrl', icon: <GlobalOutlined />, label: 'Website', color: '#06b6d4' },
];

const InfoItem = ({ icon, label, value, href }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
    <span style={{ color: 'var(--color-primary-light)', fontSize: 17, width: 20, flexShrink: 0 }}>{icon}</span>
    <div>
      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', fontSize: '0.95rem', textDecoration: 'none' }}>{value}</a>
      ) : (
        <div style={{ color: 'var(--color-text)', fontSize: '0.95rem' }}>{value}</div>
      )}
    </div>
  </div>
);

const About = () => {
  const { data: profile, loading, error, refetch } = useFetch(profileService.get);
  const activeSocials = SOCIAL_MAP.filter(s => profile?.[s.key]);

  return (
    <div className="section">
      <SEO title="About" description="Learn about Tim's background, story, and what drives him as a software engineer." />
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="section-eyebrow" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>About Me</span>
        </div>
        <motion.h1 className="section-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          The Person Behind the Code
        </motion.h1>
        <p className="section-subtitle">Get to know me, my background, and what drives me</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
        ) : error ? (
          <Result status="error" title="Failed to load profile" subTitle={error} extra={<Button type="primary" onClick={refetch}>Retry</Button>} />
        ) : (
          <Row gutter={[48, 48]} align="top">
            <Col xs={24} lg={14}>
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="glow-card" style={{ padding: 36 }}>
                  <h2 style={{ color: 'var(--color-heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 20 }}>Who I Am</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.9, marginBottom: 24 }}>
                    {profile?.summary || 'I am a passionate Software Enginneer dedicated to crafting high-quality, scalable web applications. With expertise spanning the full development stack, I bring ideas to life through clean code and thoughtful design.'}
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.9 }}>
                    I specialize in building modern web applications using technologies like React, Vue.js, Node.js, and MongoDB. I&apos;m passionate about creating seamless user experiences and writing maintainable code.
                  </p>
                </div>
              </motion.div>
            </Col>

            <Col xs={24} lg={10}>
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="glow-card" style={{ padding: 32 }}>
                  {/* Avatar */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar
                        size={110}
                        src={profile?.avatar}
                        icon={!profile?.avatar && <UserOutlined />}
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                          border: '4px solid rgba(99,102,241,0.4)',
                          boxShadow: '0 0 30px rgba(99,102,241,0.3)',
                        }}
                      />
                      <span style={{
                        position: 'absolute', bottom: 4, right: 4,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#22c55e', border: '2px solid var(--bg-card)',
                      }} />
                    </div>
                  </div>

                  <h3 style={{ color: 'var(--color-heading)', fontWeight: 700, marginBottom: 2, fontSize: '1.1rem', textAlign: 'center' }}>{profile?.fullName || 'Tim Bin'}</h3>
                  <p style={{ color: 'var(--color-primary-light)', fontSize: '0.9rem', textAlign: 'center', marginBottom: 20 }}>{profile?.title}</p>

                  <div style={{ borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 16 }}>
                    {profile?.location && <InfoItem icon={<EnvironmentOutlined />} label="Location" value={profile.location} />}
                    {profile?.email && <InfoItem icon={<MailOutlined />} label="Email" value={profile.email} href={`mailto:${profile.email}`} />}
                    {profile?.phone && <InfoItem icon={<PhoneOutlined />} label="Phone" value={profile.phone} href={`tel:${profile.phone}`} />}
                  </div>

                  {/* Social icons */}
                  {activeSocials.length > 0 && (
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(99,102,241,0.15)' }}>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Connect</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {activeSocials.map(({ key, icon, label, color }) => (
                          <Tooltip key={key} title={label}>
                            <a href={profile[key]} target="_blank" rel="noopener noreferrer">
                              <div style={{
                                width: 38, height: 38, borderRadius: 9,
                                background: `${color}18`, border: `1px solid ${color}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color, fontSize: 16, transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                {icon}
                              </div>
                            </a>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default About;
