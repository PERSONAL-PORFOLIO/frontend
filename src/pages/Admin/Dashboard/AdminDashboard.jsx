import React from 'react';
import { Row, Col, Typography } from 'antd';
import { motion } from 'framer-motion';
import {
  ThunderboltOutlined, ProjectOutlined, HistoryOutlined,
  MailOutlined, BookOutlined, SafetyCertificateOutlined,
  StarOutlined, EditOutlined,
} from '@ant-design/icons';
import useFetch from '../../../hooks/useFetch';
import {
  skillService, projectService, experienceService,
  contactService, educationService, certificateService,
  testimonialService, postService,
} from '../../../services/api';

const StatCard = ({ title, value, icon, color, sub, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={{ height: '100%' }}>
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(99,102,241,0.15)',
      borderRadius: 14, padding: '20px',
      display: 'flex', alignItems: 'center', gap: 14,
      height: '100%', boxSizing: 'border-box',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginBottom: 2 }}>{title}</div>
        <div style={{ color: 'var(--color-heading)', fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1 }}>{value ?? '—'}</div>
        {sub && <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { data: skills }        = useFetch(skillService.getAll);
  const { data: projects }      = useFetch(projectService.getAll);
  const { data: experiences }   = useFetch(experienceService.getAll);
  const { data: contacts }      = useFetch(contactService.getAll);
  const { data: educations }    = useFetch(educationService.getAll);
  const { data: certificates }  = useFetch(certificateService.getAll);
  const { data: testimonials }  = useFetch(testimonialService.getAll);
  const { data: posts }         = useFetch(postService.getAdmin);

  const unread       = contacts?.filter(c => !c.read).length ?? 0;
  const publishedPosts = posts?.filter(p => p.published).length ?? 0;

  const stats = [
    { title: 'Skills',       value: skills?.length,        icon: <ThunderboltOutlined />, color: '#6366f1', delay: 0.05 },
    { title: 'Projects',     value: projects?.length,      icon: <ProjectOutlined />,    color: '#06b6d4', delay: 0.10 },
    { title: 'Experience',   value: experiences?.length,   icon: <HistoryOutlined />,    color: '#10b981', delay: 0.15 },
    { title: 'Education',    value: educations?.length,    icon: <BookOutlined />,       color: '#8b5cf6', delay: 0.20 },
    { title: 'Certificates', value: certificates?.length,  icon: <SafetyCertificateOutlined />, color: '#f59e0b', delay: 0.25 },
    { title: 'Testimonials', value: testimonials?.length,  icon: <StarOutlined />,       color: '#ec4899', delay: 0.30 },
    {
      title: 'Blog Posts',
      value: publishedPosts,
      icon: <EditOutlined />,
      color: '#14b8a6',
      sub: posts?.length ? `${posts.length - publishedPosts} draft${posts.length - publishedPosts !== 1 ? 's' : ''}` : undefined,
      delay: 0.35,
    },
    {
      title: 'Messages',
      value: unread ? `${unread} new` : (contacts?.length ?? 0),
      icon: <MailOutlined />,
      color: unread ? '#ef4444' : '#f59e0b',
      sub: unread ? 'unread' : 'total received',
      delay: 0.40,
    },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 28 }}>
        <Typography.Title level={3} style={{ color: 'var(--color-heading)', margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>
          Dashboard
        </Typography.Title>
        <Typography.Text style={{ color: 'var(--color-text-muted)', fontSize: '0.87rem' }}>
          Portfolio content overview
        </Typography.Text>
      </motion.div>

      <Row gutter={[14, 14]}>
        {stats.map((s) => (
          <Col key={s.title} xs={12} sm={8} lg={6}>
            <StatCard {...s} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminDashboard;
