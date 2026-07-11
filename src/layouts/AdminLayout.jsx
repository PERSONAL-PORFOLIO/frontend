import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Drawer, Badge, notification } from 'antd';
import {
  DashboardOutlined, UserOutlined, ThunderboltOutlined, HistoryOutlined,
  ProjectOutlined, BookOutlined, SafetyCertificateOutlined, MailOutlined,
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, CodeOutlined,
  SettingOutlined, MenuOutlined, CloseOutlined, BellOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { contactService } from '../services/api';

const { Sider, Header, Content } = Layout;

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const buildMenuItems = (unread) => [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/profile', icon: <UserOutlined />, label: 'Profile' },
  { key: '/admin/skills', icon: <ThunderboltOutlined />, label: 'Skills' },
  { key: '/admin/experience', icon: <HistoryOutlined />, label: 'Experience' },
  { key: '/admin/projects', icon: <ProjectOutlined />, label: 'Projects' },
  { key: '/admin/education', icon: <BookOutlined />, label: 'Education' },
  { key: '/admin/certificates', icon: <SafetyCertificateOutlined />, label: 'Certificates' },
  { key: '/admin/blog', icon: <EditOutlined />, label: 'Blog' },
  {
    key: '/admin/messages',
    icon: <MailOutlined />,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Messages
        {unread > 0 && (
          <Badge count={unread} size="small" style={{ background: '#6366f1', marginLeft: 6 }} />
        )}
      </span>
    ),
  },
  { key: '/admin/settings', icon: <SettingOutlined />, label: 'Settings' },
];

/* ── Sidebar content — shared between desktop Sider & mobile Drawer ── */
const SidebarContent = ({ collapsed, onNavigate, unread }) => {
  const location = useLocation();
  const items = buildMenuItems(unread);
  return (
    <>
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--admin-sider-border, rgba(99,102,241,0.15))',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CodeOutlined style={{ color: 'white', fontSize: 16 }} />
        </div>
        {!collapsed && (
          <Typography.Text strong style={{ color: 'var(--color-heading)', fontSize: '1rem', whiteSpace: 'nowrap' }}>
            Admin Panel
          </Typography.Text>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items.map(item => ({ ...item, onClick: () => onNavigate(item.key) }))}
        style={{ background: 'transparent', border: 'none', marginTop: 8 }}
      />
    </>
  );
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [unread, setUnread] = useState(0);
  const prevUnread = useRef(0);
  const [notifApi, notifContext] = notification.useNotification();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = useTheme();

  /* ── Track mobile breakpoint ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Close mobile drawer on route change ── */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* ── Poll unread count every 30 s ── */
  const fetchUnread = useCallback(async () => {
    try {
      const res = await contactService.unreadCount();
      const count = res.data?.data?.count ?? 0;
      if (count > prevUnread.current && prevUnread.current !== null) {
        notifApi.info({
          message: 'New message received',
          description: `You have ${count} unread message${count > 1 ? 's' : ''}.`,
          icon: <MailOutlined style={{ color: '#6366f1' }} />,
          placement: 'topRight',
          duration: 6,
          onClick: () => navigate('/admin/messages'),
          style: { cursor: 'pointer' },
        });
      }
      prevUnread.current = count;
      setUnread(count);
    } catch {
      /* silently ignore if not authed yet */
    }
  }, [notifApi, navigate]);

  useEffect(() => {
    fetchUnread();
    const timer = setInterval(fetchUnread, 30_000);
    return () => clearInterval(timer);
  }, [fetchUnread]);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const handleNavigate = (key) => {
    navigate(key);
    if (isMobile) setMobileOpen(false);
  };

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: handleLogout },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--admin-layout-bg)' }}>
      {notifContext}

      {/* ── Desktop: fixed sidebar ── */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={240}
          style={{
            background: 'var(--admin-sider-bg)',
            borderRight: '1px solid var(--admin-sider-border, rgba(99,102,241,0.15))',
            position: 'fixed', height: '100vh', left: 0, top: 0,
            overflow: 'auto', zIndex: 100,
            transition: 'background 0.3s ease',
          }}
        >
          <SidebarContent collapsed={collapsed} onNavigate={handleNavigate} unread={unread} />
        </Sider>
      )}

      {/* ── Mobile: slide-in drawer ── */}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          placement="left"
          width={240}
          styles={{
            body: { padding: 0, background: 'var(--admin-sider-bg)', overflow: 'auto' },
            header: { display: 'none' },
          }}
          closeIcon={null}
        >
          <SidebarContent collapsed={false} onNavigate={handleNavigate} unread={unread} />
        </Drawer>
      )}

      {/* ── Main content area ── */}
      <Layout style={{
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 240),
        transition: 'margin-left 0.2s',
        background: 'var(--admin-layout-bg)',
      }}>
        <Header style={{
          background: 'var(--admin-header-bg)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--admin-sider-border, rgba(99,102,241,0.15))',
          padding: '0 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 99,
          transition: 'background 0.3s ease',
        }}>
          {/* Hamburger (mobile) / collapse toggle (desktop) */}
          <Button
            type="text"
            icon={isMobile
              ? (mobileOpen ? <CloseOutlined /> : <MenuOutlined />)
              : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)
            }
            onClick={() => isMobile ? setMobileOpen(v => !v) : setCollapsed(v => !v)}
            style={{ color: 'var(--color-text-muted)', fontSize: 18 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
            {!isMobile && (
              <NavLink to="/" target="_blank" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                View Site ↗
              </NavLink>
            )}

            {/* ── Notification bell ── */}
            <Badge count={unread} size="small" offset={[-2, 2]} styles={{ indicator: { background: '#6366f1' } }}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                onClick={() => navigate('/admin/messages')}
                title={unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'Messages'}
                style={{ color: unread > 0 ? '#6366f1' : 'var(--color-text-muted)', padding: '0 6px' }}
              />
            </Badge>

            <button className="theme-toggle" onClick={toggle} title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar style={{
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  flexShrink: 0, width: 32, height: 32, lineHeight: '32px', fontSize: 14,
                }}>
                  {user?.username?.[0]?.toUpperCase() || 'A'}
                </Avatar>
                {!isMobile && (
                  <Typography.Text style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>
                    {user?.username || 'Admin'}
                  </Typography.Text>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ padding: isMobile ? 12 : 24, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
