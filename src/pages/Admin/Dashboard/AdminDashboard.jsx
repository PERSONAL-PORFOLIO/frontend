import React, { useState } from 'react';
import { Row, Col, Typography, Segmented, Table, Tag } from 'antd';
import { motion } from 'framer-motion';
import {
  ThunderboltOutlined, ProjectOutlined, HistoryOutlined,
  MailOutlined, BookOutlined, SafetyCertificateOutlined,
  EyeOutlined, CalendarOutlined, UserOutlined, BarChartOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts';
import useFetch from '../../../hooks/useFetch';
import {
  skillService, projectService, experienceService,
  contactService, educationService, certificateService,
  analyticsService,
} from '../../../services/api';

/* ── Small stat card ─────────────────────────────────────────── */
const StatCard = ({ title, value, icon, color, sub, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={{ height: '100%' }}>
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(99,102,241,0.15)',
      borderRadius: 14, padding: '16px',
      display: 'flex', alignItems: 'center', gap: 14,
      height: '100%', boxSizing: 'border-box',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}20`, border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          color: 'var(--color-text-muted)', fontSize: '0.78rem', marginBottom: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</div>
        <div style={{ color: 'var(--color-heading)', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>{value ?? '—'}</div>
        {sub && <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  </motion.div>
);

/* ── Section header ──────────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <div style={{
    color: 'var(--color-heading)', fontWeight: 700, fontSize: '1rem',
    marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
  }}>
    {children}
  </div>
);

/* ── Recharts custom tooltip ─────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: 8, padding: '8px 14px', fontSize: '0.85rem',
    }}>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#6366f1', fontWeight: 700 }}>
        {payload[0].value} visit{payload[0].value !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState(30);

  // ── Portfolio content counts ────────────────────────────────
  const { data: skills } = useFetch(skillService.getAll);
  const { data: projects } = useFetch(projectService.getAll);
  const { data: experiences } = useFetch(experienceService.getAll);
  const { data: contacts } = useFetch(contactService.getAll);
  const { data: educations } = useFetch(educationService.getAll);
  const { data: certificates } = useFetch(certificateService.getAll);

  // ── Analytics ───────────────────────────────────────────────
  const { data: overview } = useFetch(analyticsService.overview);
  const { data: timeline } = useFetch(() => analyticsService.timeline(timeRange));
  const { data: topPages } = useFetch(analyticsService.pages);
  const { data: recent } = useFetch(analyticsService.recent);

  const unread = contacts?.filter(c => !c.read).length ?? 0;

  // Format date labels for the chart (show "Jun 17" style)
  const chartData = (timeline || []).map(d => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Top pages: show max 8, trim long paths
  const pagesData = (topPages || []).slice(0, 8).map(p => ({
    page: p.page === '/' ? 'Home' : p.page.replace(/^\//, ''),
    visits: p.visits,
  }));

  // Recent visits table
  const recentColumns = [
    {
      title: 'Page',
      dataIndex: 'page',
      key: 'page',
      ellipsis: true,
      render: (v) => <Tag color="geekblue" style={{ fontFamily: 'monospace', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</Tag>,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      responsive: ['md'],
      render: (v) => <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{v}</span>,
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          {new Date(v).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
  ];

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: 14, padding: 24,
  };

  return (
    <div>
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 20 }}>
        <Typography.Title level={3} style={{ color: 'var(--color-heading)', margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>Dashboard</Typography.Title>
        <Typography.Text style={{ color: 'var(--color-text-muted)', fontSize: '0.87rem' }}>
          Welcome back! Here&apos;s your portfolio analytics.
        </Typography.Text>
      </motion.div>

      {/* ── Visitor overview stats ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 8 }}>
        <SectionTitle><EyeOutlined style={{ color: '#6366f1' }} /> Visitor Overview</SectionTitle>
      </motion.div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={12} xl={6}>
          <StatCard title="Total Visits" value={overview?.total?.toLocaleString()} icon={<EyeOutlined />} color="#6366f1" sub="all time" delay={0} />
        </Col>
        <Col xs={12} sm={12} xl={6}>
          <StatCard title="Today" value={overview?.today?.toLocaleString()} icon={<CalendarOutlined />} color="#06b6d4" sub="page views" delay={0.05} />
        </Col>
        <Col xs={12} sm={12} xl={6}>
          <StatCard title="This Week" value={overview?.week?.toLocaleString()} icon={<BarChartOutlined />} color="#10b981" sub="last 7 days" delay={0.1} />
        </Col>
        <Col xs={12} sm={12} xl={6}>
          <StatCard title="Unique Visitors" value={overview?.uniqueVisitors?.toLocaleString()} icon={<UserOutlined />} color="#f59e0b" sub="by IP" delay={0.15} />
        </Col>
      </Row>

      {/* ── Traffic over time chart ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <SectionTitle><BarChartOutlined style={{ color: '#06b6d4' }} /> Traffic Over Time</SectionTitle>
                <Segmented
                  value={timeRange}
                  onChange={setTimeRange}
                  options={[
                    { label: '7 days', value: 7 },
                    { label: '30 days', value: 30 },
                    { label: '90 days', value: 90 },
                  ]}
                  style={{ background: 'rgba(99,102,241,0.1)' }}
                />
              </div>

              {chartData.length === 0 ? (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                  No visit data yet — share your portfolio link to start tracking!
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={timeRange <= 7 ? 0 : timeRange <= 30 ? 4 : 9}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <ReTooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* ── Top pages + Recent visits ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {/* Top pages */}
        <Col xs={24} lg={12}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div style={{ ...cardStyle, height: '100%' }}>
              <SectionTitle><EyeOutlined style={{ color: '#10b981' }} /> Top Pages</SectionTitle>
              {pagesData.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 40 }}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={pagesData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="page" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
                    <ReTooltip content={<ChartTooltip />} />
                    <Bar dataKey="visits" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </Col>

        {/* Recent visits */}
        <Col xs={24} lg={12}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div style={{ ...cardStyle, height: '100%' }}>
              <SectionTitle><CalendarOutlined style={{ color: '#f59e0b' }} /> Recent Visits</SectionTitle>
              <Table
                dataSource={recent || []}
                columns={recentColumns}
                rowKey="_id"
                size="small"
                pagination={false}
                scroll={{ y: 200 }}
                style={{ background: 'transparent' }}
                rowClassName={() => 'analytics-row'}
              />
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* ── Portfolio content counts ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ marginBottom: 8 }}>
        <SectionTitle><ProjectOutlined style={{ color: '#8b5cf6' }} /> Portfolio Content</SectionTitle>
      </motion.div>
      <Row gutter={[12, 12]}>
        {[
          { title: 'Skills', value: skills?.length, icon: <ThunderboltOutlined />, color: '#6366f1', delay: 0.36 },
          { title: 'Projects', value: projects?.length, icon: <ProjectOutlined />, color: '#06b6d4', delay: 0.38 },
          { title: 'Experience', value: experiences?.length, icon: <HistoryOutlined />, color: '#10b981', delay: 0.40 },
          { title: 'Messages', value: unread ? `${unread} new` : contacts?.length, icon: <MailOutlined />, color: unread ? '#ef4444' : '#f59e0b', sub: unread ? 'unread' : 'total', delay: 0.42 },
          { title: 'Education', value: educations?.length, icon: <BookOutlined />, color: '#8b5cf6', delay: 0.44 },
          { title: 'Certs', value: certificates?.length, icon: <SafetyCertificateOutlined />, color: '#f59e0b', delay: 0.46 },
        ].map((s) => (
          <Col key={s.title} xs={12} sm={8} xl={4}>
            <StatCard {...s} />
          </Col>
        ))}
      </Row>

      <style>{`
        .analytics-row td { background: transparent !important; border-color: rgba(99,102,241,0.08) !important; }
        .analytics-row:hover td { background: rgba(99,102,241,0.06) !important; }
        .ant-table-thead > tr > th { background: rgba(99,102,241,0.08) !important; color: #94a3b8 !important; border-color: rgba(99,102,241,0.1) !important; font-size: 0.8rem; }
        .ant-table { background: transparent !important; }
        .ant-table-placeholder { background: transparent !important; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
