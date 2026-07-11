import React, { useState, useEffect, useCallback } from 'react';
import {
  Form, Input, Switch, Button, App, Tabs, Typography,
  Tag, Alert,
} from 'antd';
import {
  SaveOutlined, GlobalOutlined, AppstoreOutlined,
  LayoutOutlined, MailOutlined, HomeOutlined,
  PlusOutlined, DeleteOutlined,
  EyeOutlined, EyeInvisibleOutlined,
  LinkOutlined, WarningOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { settingsService } from '@/services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ── Helpers ────────────────────────────────────────────────────── */
const SettingCard = ({ icon, title, desc, children, accent }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: `1px solid ${accent ? 'rgba(239,68,68,0.25)' : 'var(--color-border)'}`,
    borderRadius: 14, padding: 24, marginBottom: 20,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: accent ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.15)',
        border: `1px solid ${accent ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent ? '#ef4444' : 'var(--color-primary-light)', fontSize: 16,
      }}>{icon}</div>
      <div>
        <div style={{ color: 'var(--color-heading)', fontWeight: 700, fontSize: '0.95rem' }}>{title}</div>
        {desc && <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 2 }}>{desc}</div>}
      </div>
    </div>
    {children}
  </div>
);

const ToggleRow = ({ label, sub, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderRadius: 10,
    background: 'var(--stat-card-bg)', marginBottom: 10,
    border: '1px solid rgba(99,102,241,0.12)',
  }}>
    <div>
      <div style={{ color: 'var(--color-heading)', fontWeight: 500, fontSize: '0.9rem' }}>{label}</div>
      {sub && <div style={{ color: 'var(--color-text-muted)', fontSize: '0.79rem', marginTop: 1 }}>{sub}</div>}
    </div>
    {children}
  </div>
);

const NavToggle = ({ label, value, onChange }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', borderRadius: 10,
    background: 'var(--stat-card-bg)', marginBottom: 8,
    border: '1px solid rgba(99,102,241,0.12)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {value
        ? <EyeOutlined style={{ color: '#22c55e', fontSize: 14 }} />
        : <EyeInvisibleOutlined style={{ color: '#ef4444', fontSize: 14 }} />}
      <span style={{ color: value ? 'var(--color-heading)' : 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>{label}</span>
    </div>
    <Switch checked={value} onChange={onChange} size="small" style={{ background: value ? '#6366f1' : undefined }} />
  </div>
);

/* ── Link preview (like Telegram) ───────────────────────────────── */
const LinkPreviewCard = ({ siteUrl, title, description, pagePath }) => {
  const domain = siteUrl
    ? siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : 'your-site.com';
  const fullUrl = `${domain}${pagePath === '/' ? '' : pagePath}`;

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.2)',
      background: 'rgba(99,102,241,0.05)',
      marginTop: 16,
    }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 4, background: 'linear-gradient(180deg,#6366f1,#06b6d4)', flexShrink: 0 }} />
        <div style={{ padding: '12px 16px', flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.74rem', color: '#06b6d4', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <LinkOutlined style={{ fontSize: 11 }} />
            {fullUrl}
          </div>
          <div style={{
            color: 'white', fontWeight: 700, fontSize: '0.9rem',
            marginBottom: 3, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title || <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Page title will appear here</span>}
          </div>
          <div style={{
            color: 'var(--color-text-muted)', fontSize: '0.8rem', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {description || <span style={{ fontStyle: 'italic' }}>Page description will appear here</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Per-Page SEO editor ─────────────────────────────────────────── */
const PAGE_OPTIONS = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'about', label: 'About', path: '/about' },
  { key: 'skills', label: 'Skills', path: '/skills' },
  { key: 'experience', label: 'Experience', path: '/experience' },
  { key: 'projects', label: 'Projects', path: '/projects' },
  { key: 'education', label: 'Education', path: '/education' },
  { key: 'certificates', label: 'Certificates', path: '/certificates' },
  { key: 'blog', label: 'Blog', path: '/blog' },
  { key: 'contact', label: 'Contact', path: '/contact' },
];

const PageSeoEditor = ({ pageSeo, onChange, siteUrl, globalTitle, globalDesc }) => {
  const [activePage, setActivePage] = useState('home');
  const current = pageSeo[activePage] || { title: '', description: '' };
  const pageInfo = PAGE_OPTIONS.find(p => p.key === activePage);

  const update = (field, value) =>
    onChange({ ...pageSeo, [activePage]: { ...current, [field]: value } });

  const previewTitle = current.title || globalTitle || 'Tim Bin | Software Engineer';
  const previewDesc = current.description || globalDesc || '';

  return (
    <div>
      {/* Page selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
        {PAGE_OPTIONS.map(p => (
          <button key={p.key} onClick={() => setActivePage(p.key)} style={{
            padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
            border: activePage === p.key ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(99,102,241,0.2)',
            background: activePage === p.key ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.05)',
            color: activePage === p.key ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
            fontSize: '0.83rem', fontWeight: activePage === p.key ? 600 : 400, transition: 'all 0.15s',
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Path badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 12px', borderRadius: 6, marginBottom: 14,
        background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
        fontFamily: 'monospace', fontSize: '0.8rem', color: '#06b6d4',
      }}>
        <LinkOutlined style={{ fontSize: 11 }} />
        {pageInfo?.path}
      </div>

      <Form.Item label={<span style={{ color: 'var(--color-text-muted)' }}>
        Page Title <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>(blank = use global site title)</span>
      </span>} style={{ marginBottom: 12 }}>
        <Input value={current.title} onChange={e => update('title', e.target.value)}
          placeholder={`e.g. Tim Bin | ${pageInfo?.label}`} showCount maxLength={70} />
      </Form.Item>

      <Form.Item label={<span style={{ color: 'var(--color-text-muted)' }}>
        Page Description <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>(blank = use global description)</span>
      </span>} style={{ marginBottom: 4 }}>
        <TextArea value={current.description} onChange={e => update('description', e.target.value)}
          rows={2} placeholder="Brief description for this page (150–160 chars)" showCount maxLength={160} />
      </Form.Item>

      {/* Live preview */}
      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 18, marginBottom: 2 }}>
        Preview — Telegram / WhatsApp / Slack
      </div>
      <LinkPreviewCard siteUrl={siteUrl} title={previewTitle} description={previewDesc} pagePath={pageInfo?.path || '/'} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════ */
const AdminSettings = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const VALID_TABS = ['seo', 'layout', 'home', 'inbox'];
  const hashTab = window.location.hash.replace('#', '');
  const [activeTab, setActiveTab] = useState(VALID_TABS.includes(hashTab) ? hashTab : 'seo');
  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
    window.history.replaceState(null, '', `#${key}`);
  }, []);

  const [saving, setSaving] = useState(false);
  const [navVisibility, setNavVisibility] = useState({
    about: true, skills: true, experience: true, projects: true,
    education: true, certificates: true, blog: true, contact: true,
  });
  const [typingRoles, setTypingRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [showFooter, setShowFooter] = useState(true);
  const [allowContactForm, setAllowContactForm] = useState(true);
  const [availableForWork, setAvailableForWork] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [pageSeo, setPageSeo] = useState({});
  const [autoReply, setAutoReply] = useState({
    enabled: false,
    subject: 'Thanks for reaching out, {{name}}!',
    body: '',
  });

  useEffect(() => {
    settingsService.getAdmin()
      .then(res => {
        const s = res.data.data;
        form.setFieldsValue({
          siteTitle: s.siteTitle,
          seoDescription: s.seoDescription,
          seoKeywords: s.seoKeywords,
          ogImage: s.ogImage,
          siteUrl: s.siteUrl,
          footerText: s.footerText,
          notificationEmail: s.notificationEmail,
          maintenanceMessage: s.maintenanceMessage,
          googleAnalyticsId: s.googleAnalyticsId,
          heroBadge: s.heroBadge,
          ctaHeading: s.ctaHeading,
          ctaSubtext: s.ctaSubtext,
        });
        setNavVisibility(s.navVisibility || {});
        setTypingRoles(s.typingRoles || []);
        setShowFooter(s.showFooter !== false);
        setAllowContactForm(s.allowContactForm !== false);
        setAvailableForWork(s.availableForWork !== false);
        setMaintenanceMode(s.maintenanceMode === true);
        setPageSeo(s.pageSeo || {});
        if (s.autoReply) setAutoReply(s.autoReply);
      })
      .catch(() => message.error('Failed to load settings'));
  }, [form, message]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await settingsService.update({
        ...values, navVisibility, typingRoles, showFooter,
        allowContactForm, availableForWork, maintenanceMode, pageSeo, autoReply,
      });
      message.success('Settings saved!');
    } catch (err) {
      if (err?.errorFields) return;
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addRole = () => {
    const t = newRole.trim();
    if (!t) return;
    if (typingRoles.includes(t)) { message.warning('Role already exists'); return; }
    setTypingRoles(r => [...r, t]);
    setNewRole('');
  };

  const NAV_ITEMS = [
    { key: 'about', label: 'About' }, { key: 'skills', label: 'Skills' },
    { key: 'experience', label: 'Experience' }, { key: 'projects', label: 'Projects' },
    { key: 'education', label: 'Education' }, { key: 'certificates', label: 'Certificates' },
    { key: 'blog', label: 'Blog' }, { key: 'contact', label: 'Contact' },
  ];

  const watchedSiteTitle = Form.useWatch('siteTitle', form);
  const watchedSeoDesc = Form.useWatch('seoDescription', form);
  const watchedSiteUrl = Form.useWatch('siteUrl', form);

  const tabItems = [
    /* ── SEO ─────────────────────────────────────────────────── */
    {
      key: 'seo',
      label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><GlobalOutlined /> SEO</span>,
      children: (
        <div>
          <SettingCard icon={<GlobalOutlined />} title="Global Identity"
            desc="Fallback title & description for any page without its own SEO">
            <Form.Item name="siteTitle" label={<span style={{ color: 'var(--color-text-muted)' }}>Site Title</span>}>
              <Input placeholder="Tim Bin – Software Engineer" showCount maxLength={70} />
            </Form.Item>
            <Form.Item name="seoDescription" label={<span style={{ color: 'var(--color-text-muted)' }}>Meta Description</span>}>
              <TextArea rows={2} placeholder="Brief description for search engines (150–160 chars)" showCount maxLength={160} />
            </Form.Item>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name="seoKeywords" label={<span style={{ color: 'var(--color-text-muted)' }}>Keywords</span>} style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder="developer, react, nodejs, fullstack" />
              </Form.Item>
              <Form.Item name="googleAnalyticsId" label={<span style={{ color: 'var(--color-text-muted)' }}>Analytics ID</span>} style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder="G-XXXXXXXXXX" />
              </Form.Item>
            </div>
          </SettingCard>

          <SettingCard icon={<LinkOutlined />} title="Open Graph"
            desc="Social sharing image and canonical URL (Telegram, WhatsApp, Slack)">
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name="siteUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>Production URL</span>} style={{ flex: 1 }}>
                <Input placeholder="https://bintim.com" prefix={<LinkOutlined style={{ color: 'var(--color-text-muted)' }} />} />
              </Form.Item>
              <Form.Item name="ogImage" label={<span style={{ color: 'var(--color-text-muted)' }}>OG Image URL</span>} style={{ flex: 2, marginBottom: 0 }}>
                <Input placeholder="https://yoursite.com/og-image.png (1200×630)" />
              </Form.Item>
            </div>
          </SettingCard>

          <SettingCard icon={<AppstoreOutlined />} title="Per-Page SEO"
            desc="Custom title & description for each page — shown in search results and link previews">
            <PageSeoEditor
              pageSeo={pageSeo} onChange={setPageSeo}
              siteUrl={watchedSiteUrl} globalTitle={watchedSiteTitle} globalDesc={watchedSeoDesc}
            />
          </SettingCard>
        </div>
      ),
    },

    /* ── Layout (Navigation + Footer) ────────────────────────── */
    {
      key: 'layout',
      label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><LayoutOutlined /> Layout</span>,
      children: (
        <div>
          <SettingCard icon={<AppstoreOutlined />} title="Navigation"
            desc="Toggle which pages appear in the public menu. Home is always visible.">
            <div style={{ padding: '10px 16px', borderRadius: 10, marginBottom: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <EyeOutlined style={{ color: '#22c55e', fontSize: 14 }} />
                <span style={{ color: 'var(--color-heading)', fontWeight: 500, fontSize: '0.9rem' }}>Home</span>
              </div>
              <Tag color="green" style={{ margin: 0 }}>Always visible</Tag>
            </div>
            {NAV_ITEMS.map(({ key, label }) => (
              <NavToggle key={key} label={label} value={navVisibility[key] !== false}
                onChange={c => setNavVisibility(p => ({ ...p, [key]: c }))} />
            ))}
          </SettingCard>

          <SettingCard icon={<LayoutOutlined />} title="Footer"
            desc="Control what appears at the bottom of every page">
            <ToggleRow label="Show Footer" sub="Display footer on all public pages">
              <Switch checked={showFooter} onChange={setShowFooter}
                style={{ background: showFooter ? '#6366f1' : undefined }} />
            </ToggleRow>
            <Form.Item name="footerText" label={<span style={{ color: 'var(--color-text-muted)' }}>Copyright Text</span>} style={{ marginBottom: 0, marginTop: 4 }}>
              <Input
                placeholder={`© ${new Date().getFullYear()} Tim Bin · Crafted with React & Ant Design`}
                disabled={!showFooter}
              />
            </Form.Item>
          </SettingCard>
        </div>
      ),
    },

    /* ── Home Page ────────────────────────────────────────────── */
    {
      key: 'home',
      label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HomeOutlined /> Home</span>,
      children: (
        <div>
          <SettingCard icon={<HomeOutlined />} title="Hero & CTA"
            desc="Availability badge and call-to-action section">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, padding: '12px 16px', borderRadius: 10,
              background: availableForWork ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${availableForWork ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: availableForWork ? '#22c55e' : '#ef4444',
                  display: 'inline-block',
                  boxShadow: availableForWork ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
                }} />
                <span style={{ color: 'var(--color-heading)', fontWeight: 600, fontSize: '0.9rem' }}>
                  {availableForWork ? 'Available for work' : 'Not available'}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>— hero badge status</span>
              </div>
              <Switch checked={availableForWork} onChange={setAvailableForWork}
                style={{ background: availableForWork ? '#22c55e' : undefined }} />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name="heroBadge" label={<span style={{ color: 'var(--color-text-muted)' }}>Badge Text</span>} style={{ flex: 1 }}>
                <Input placeholder="Available for work" />
              </Form.Item>
              <Form.Item name="ctaHeading" label={<span style={{ color: 'var(--color-text-muted)' }}>CTA Heading</span>} style={{ flex: 2 }}>
                <Input placeholder="Let's Build Something Amazing Together" />
              </Form.Item>
            </div>
            <Form.Item name="ctaSubtext" label={<span style={{ color: 'var(--color-text-muted)' }}>CTA Subtext</span>} style={{ marginBottom: 0 }}>
              <TextArea rows={2} placeholder="I'm currently open to freelance projects..." />
            </Form.Item>
          </SettingCard>

          <SettingCard icon={<HomeOutlined />} title="Typing Roles"
            desc="Text that cycles in the hero typewriter effect">
            <div style={{
              padding: '12px 20px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: 'var(--color-primary-light)', marginRight: 8 }}>&gt;</span>
              <span style={{ color: 'var(--color-heading)' }}>{typingRoles[0] || 'Software Engineer'}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.76rem', marginLeft: 12 }}>preview</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {typingRoles.map(role => (
                <Tag key={role} closable onClose={() => setTypingRoles(r => r.filter(x => x !== role))}
                  style={{
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                    color: 'var(--color-primary-light)', borderRadius: 20, padding: '4px 12px', fontSize: '0.83rem',
                  }}
                  closeIcon={<DeleteOutlined style={{ color: '#ef4444', fontSize: 11 }} />}
                >{role}</Tag>
              ))}
              {!typingRoles.length && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.83rem' }}>No roles yet</span>}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Input value={newRole} onChange={e => setNewRole(e.target.value)} onPressEnter={addRole}
                placeholder="e.g. Cloud Architect" style={{ flex: 1 }} />
              <Button type="primary" icon={<PlusOutlined />} onClick={addRole} disabled={!newRole.trim()}
                style={{ background: 'var(--gradient-primary)', border: 'none' }}>Add</Button>
            </div>
          </SettingCard>
        </div>
      ),
    },

    /* ── Inbox (Contact + Auto-Reply) ────────────────────────── */
    {
      key: 'inbox',
      label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MailOutlined /> Inbox</span>,
      children: (
        <div>
          <SettingCard icon={<MailOutlined />} title="Contact Form"
            desc="Where to receive alerts and whether the public form is active">
            <Form.Item name="notificationEmail"
              label={<span style={{ color: 'var(--color-text-muted)' }}>Receive Alerts At</span>}
              rules={[{ type: 'email', message: 'Enter a valid email' }]}
              style={{ marginBottom: 16 }}>
              <Input placeholder="you@example.com"
                prefix={<MailOutlined style={{ color: 'var(--color-text-muted)' }} />} />
            </Form.Item>

            <ToggleRow label="Allow Contact Submissions" sub="When off, shows a 'currently unavailable' message">
              <Switch checked={allowContactForm} onChange={setAllowContactForm}
                style={{ background: allowContactForm ? '#6366f1' : undefined }} />
            </ToggleRow>

            <Alert type="info" showIcon
              style={{ marginTop: 4, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8 }}
              message={<span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                Email notifications require SMTP credentials in <code style={{ color: 'var(--color-primary-light)' }}>.env</code>. Messages are always saved regardless.
              </span>}
            />
          </SettingCard>

          <SettingCard icon={<MailOutlined />} title="Auto-Reply"
            desc="Automatically send a confirmation email to visitors when they submit the contact form">
            <ToggleRow
              label={autoReply.enabled ? 'Auto-reply is ON' : 'Auto-reply is OFF'}
              sub="Sends a reply instantly when someone submits the contact form"
            >
              <Switch checked={autoReply.enabled} onChange={v => setAutoReply(a => ({ ...a, enabled: v }))}
                style={{ background: autoReply.enabled ? '#22c55e' : undefined }} />
            </ToggleRow>

            <div style={{ marginTop: 16, marginBottom: 12 }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', marginBottom: 6 }}>Email Subject</div>
              <Input value={autoReply.subject}
                onChange={e => setAutoReply(a => ({ ...a, subject: e.target.value }))}
                placeholder="Thanks for reaching out, {{name}}!"
                disabled={!autoReply.enabled} />
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem', marginTop: 4 }}>
                Variables: <code style={{ color: 'var(--color-primary-light)' }}>{'{{name}}'}</code>{' '}
                <code style={{ color: 'var(--color-primary-light)' }}>{'{{subject}}'}</code>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', marginBottom: 6 }}>
                Email Body <span style={{ opacity: 0.6, fontSize: '0.78rem' }}>(HTML supported)</span>
              </div>
              <TextArea rows={8} value={autoReply.body}
                onChange={e => setAutoReply(a => ({ ...a, body: e.target.value }))}
                disabled={!autoReply.enabled}
                placeholder={`<p>Hi <strong>{{name}}</strong>,</p>\n<p>Thank you for reaching out! I'll get back to you as soon as possible.</p>\n<p>Best regards,<br><strong>Tim</strong></p>`}
                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }} />
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem', marginTop: 4 }}>
                Variables: <code style={{ color: 'var(--color-primary-light)' }}>{'{{name}}'}</code>{' '}
                <code style={{ color: 'var(--color-primary-light)' }}>{'{{subject}}'}</code>{' '}
                <code style={{ color: 'var(--color-primary-light)' }}>{'{{message}}'}</code>
                {' '}· Leave blank to use the default template.
              </div>
            </div>
          </SettingCard>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ color: 'var(--color-heading)', margin: 0 }}>Site Settings</Title>
          <Text style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            SEO, navigation, home page, and contact preferences
          </Text>
        </div>
        <Button type="primary" size="large" icon={<SaveOutlined />} loading={saving} onClick={handleSave}
          style={{ height: 44, paddingInline: 28, fontWeight: 700, background: 'var(--gradient-primary)', border: 'none', borderRadius: 10 }}>
          Save All Settings
        </Button>
      </div>

      {/* Maintenance Mode — prominent top banner */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderRadius: 12, marginBottom: 24,
        background: maintenanceMode ? 'rgba(239,68,68,0.08)' : 'var(--bg-card)',
        border: maintenanceMode ? '1px solid rgba(239,68,68,0.35)' : '1px solid var(--color-border)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <WarningOutlined style={{ color: maintenanceMode ? '#ef4444' : 'var(--color-text-muted)', fontSize: 18 }} />
          <div>
            <div style={{ color: maintenanceMode ? '#ef4444' : 'var(--color-heading)', fontWeight: 600, fontSize: '0.92rem' }}>
              Maintenance Mode
              {maintenanceMode && <span style={{ marginLeft: 8, fontSize: '0.78rem', fontWeight: 400, color: '#ef4444' }}>— site is currently offline for visitors</span>}
            </div>
            {!maintenanceMode && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                Public visitors see a maintenance page instead of your site. Admin login still works.
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {maintenanceMode && (
            <Input
              value={form.getFieldValue('maintenanceMessage') || ''}
              onChange={e => form.setFieldValue('maintenanceMessage', e.target.value)}
              placeholder="We'll be back soon! 🔧"
              style={{ width: 260 }}
            />
          )}
          <Switch checked={maintenanceMode} onChange={setMaintenanceMode}
            style={{ background: maintenanceMode ? '#ef4444' : undefined }} />
        </div>
      </div>

      <Form form={form} layout="vertical">
        <Tabs items={tabItems} activeKey={activeTab} onChange={handleTabChange}
          size="middle" style={{ color: 'var(--color-text)' }} />
      </Form>
    </motion.div>
  );
};

export default AdminSettings;
