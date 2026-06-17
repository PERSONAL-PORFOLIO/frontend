import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Form, Input, Button, App, Row, Col, Tooltip } from 'antd';
import {
  MailOutlined, SendOutlined, EnvironmentOutlined,
  GithubOutlined, LinkedinOutlined, TwitterOutlined,
  FacebookOutlined, InstagramOutlined, YoutubeOutlined,
  GlobalOutlined, PhoneOutlined,
} from '@ant-design/icons';
import { contactService, profileService } from '@/services/api';
import useFetch from '@/hooks/useFetch';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const { TextArea } = Input;

const SOCIAL_MAP = [
  { key: 'githubUrl', icon: <GithubOutlined />, label: 'GitHub', color: '#ffffff' },
  { key: 'linkedinUrl', icon: <LinkedinOutlined />, label: 'LinkedIn', color: '#0a66c2' },
  { key: 'twitterUrl', icon: <TwitterOutlined />, label: 'Twitter/X', color: '#1d9bf0' },
  { key: 'facebookUrl', icon: <FacebookOutlined />, label: 'Facebook', color: '#1877f2' },
  { key: 'instagramUrl', icon: <InstagramOutlined />, label: 'Instagram', color: '#e1306c' },
  { key: 'youtubeUrl', icon: <YoutubeOutlined />, label: 'YouTube', color: '#ff0000' },
  { key: 'websiteUrl', icon: <GlobalOutlined />, label: 'Website', color: '#06b6d4' },
];

const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { data: profile } = useFetch(profileService.get);
  const { message } = App.useApp();
  const { settings } = useSiteSettings();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await contactService.submit(values);
      message.success('Message sent! I\'ll get back to you soon.');
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeSocials = SOCIAL_MAP.filter(s => profile?.[s.key]);

  return (
    <div className="section">
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="section-eyebrow" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>Say Hello</span>
        </div>
        <motion.h1 className="section-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Get In Touch</motion.h1>
        <p className="section-subtitle">Have a project in mind? Let&apos;s talk!</p>

        <Row gutter={[48, 48]}>
          {/* ── Left: contact info + socials ─────── */}
          <Col xs={24} lg={10}>
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="glow-card" style={{ padding: 36, height: '100%' }}>
                <h2 style={{ color: 'var(--color-heading)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 20 }}>Let&apos;s Connect</h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 28 }}>
                  I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                </p>

                {/* Contact details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                  {profile?.email && (
                    <a href={`mailto:${profile.email}`} style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MailOutlined style={{ color: 'var(--color-primary-light)', fontSize: 17 }} />
                      </div>
                      <span style={{ color: 'var(--color-text)' }}>{profile.email}</span>
                    </a>
                  )}
                  {profile?.phone && (
                    <a href={`tel:${profile.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PhoneOutlined style={{ color: '#06b6d4', fontSize: 17 }} />
                      </div>
                      <span style={{ color: 'var(--color-text)' }}>{profile.phone}</span>
                    </a>
                  )}
                  {profile?.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <EnvironmentOutlined style={{ color: '#10b981', fontSize: 17 }} />
                      </div>
                      <span style={{ color: 'var(--color-text)' }}>{profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Social links */}
                {activeSocials.length > 0 && (
                  <>
                    <div style={{ borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 24, marginBottom: 16 }}>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Find me on</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {activeSocials.map(({ key, icon, label, color }) => (
                          <Tooltip key={key} title={label}>
                            <a href={profile[key]} target="_blank" rel="noopener noreferrer">
                              <div style={{
                                width: 44, height: 44, borderRadius: 11,
                                background: `${color}18`,
                                border: `1px solid ${color}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color, fontSize: 18, transition: 'all 0.2s',
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
                  </>
                )}
              </div>
            </motion.div>
          </Col>

          {/* ── Right: contact form ───────────────── */}
          <Col xs={24} lg={14}>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="glow-card" style={{ padding: 36 }}>
                <h2 style={{ color: 'var(--color-heading)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 28 }}>Send a Message</h2>

                {settings.allowContactForm === false ? (
                  <div style={{
                    padding: '32px 24px', borderRadius: 12, textAlign: 'center',
                    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📫</div>
                    <p style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: 6 }}>Contact form is temporarily unavailable</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      Please reach out directly via email or social links.
                    </p>
                  </div>
                ) : <Form form={form} layout="vertical" onFinish={handleSubmit}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="name" label={<span style={{ color: 'var(--color-text-muted)' }}>Your Name</span>} rules={[{ required: true }]}>
                        <Input placeholder="You Name" size="large" style={{ border: '1px solid var(--input-border)', borderRadius: 10 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="email" label={<span style={{ color: 'var(--color-text-muted)' }}>Email Address</span>} rules={[{ required: true, type: 'email' }]}>
                        <Input placeholder="yourname@example.com" size="large" style={{ border: '1px solid var(--input-border)', borderRadius: 10 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="subject" label={<span style={{ color: 'var(--color-text-muted)' }}>Subject</span>} rules={[{ required: true }]}>
                    <Input placeholder="Project inquiry..." size="large" style={{ border: '1px solid var(--input-border)', borderRadius: 10 }} />
                  </Form.Item>

                  <Form.Item name="message" label={<span style={{ color: 'var(--color-text-muted)' }}>Message</span>} rules={[{ required: true }]}>
                    <TextArea rows={6} placeholder="Tell me about your project..." style={{ border: '1px solid var(--input-border)', borderRadius: 10, resize: 'none' }} />
                  </Form.Item>

                  <Button
                    type="primary" htmlType="submit" size="large" loading={loading}
                    icon={<SendOutlined />}
                    style={{ height: 50, paddingInline: 32, fontWeight: 600, background: 'var(--gradient-primary)', border: 'none', borderRadius: 12, fontSize: '1rem', width: '100%' }}
                  >
                    Send Message
                  </Button>
                </Form>}
              </div>
            </motion.div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Contact;
