import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, App, Spin, Tag, Typography, Popconfirm } from 'antd';
import { ArrowLeftOutlined, SendOutlined, DeleteOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { contactService } from '@/services/api';

const { TextArea } = Input;
const { Title, Text } = Typography;

const bubble = (side, content, time, label) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: side === 'right' ? 'flex-end' : 'flex-start',
    marginBottom: 20,
  }}>
    <div style={{
      fontSize: '0.75rem', color: 'var(--color-text-muted)',
      marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {side === 'left' && <UserOutlined />}
      <span>{label}</span>
      <ClockCircleOutlined style={{ marginLeft: 4 }} />
      <span>{new Date(time).toLocaleString()}</span>
    </div>
    <div style={{
      maxWidth: '80%',
      background: side === 'right'
        ? 'linear-gradient(135deg,#6366f1,#06b6d4)'
        : 'var(--bg-card)',
      color: side === 'right' ? '#fff' : 'var(--color-text)',
      border: side === 'left' ? '1px solid rgba(99,102,241,0.2)' : 'none',
      borderRadius: side === 'right' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      padding: '12px 16px',
      lineHeight: 1.75,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {content}
    </div>
  </div>
);

const AdminMessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchContact = useCallback(async () => {
    try {
      const res = await contactService.getOne(id);
      const data = res.data?.data;
      setContact(data);
      if (!data.read) await contactService.markRead(id);
    } catch {
      message.error('Failed to load message');
    } finally {
      setLoading(false);
    }
  }, [id, message]);

  useEffect(() => { fetchContact(); }, [fetchContact]);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await contactService.reply(id, { replyMessage: replyText });
      message.success('Reply sent');
      setReplyText('');
      fetchContact();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    try {
      await contactService.delete(id);
      message.success('Message deleted');
      navigate('/admin/messages');
    } catch {
      message.error('Delete failed');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Spin size="large" />
    </div>
  );

  if (!contact) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            type="text" icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/messages')}
            style={{ color: 'var(--color-text-muted)' }}
          />
          <div>
            <Title level={4} style={{ margin: 0, color: 'var(--color-heading)' }}>
              {contact.subject}
            </Title>
            <Text style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              From: <strong style={{ color: 'var(--color-primary-light)' }}>{contact.name}</strong>
              {' '}&lt;{contact.email}&gt;
            </Text>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {contact.read
            ? <Tag color="default">Read</Tag>
            : <Tag color="purple">New</Tag>}
          <Popconfirm title="Delete this message?" onConfirm={handleDelete} okText="Yes" cancelText="No">
            <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
          </Popconfirm>
        </div>
      </div>

      {/* ── Thread ── */}
      <div style={{
        background: 'var(--admin-layout-bg)',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 16,
        padding: '24px 20px',
        minHeight: 300,
        marginBottom: 16,
      }}>
        {/* Original message */}
        {bubble('left', contact.message, contact.createdAt, contact.name)}

        {/* Reply thread */}
        {(contact.replies || []).map((r, i) => (
          <React.Fragment key={i}>
            {bubble('right', r.message, r.sentAt, 'You')}
          </React.Fragment>
        ))}

        {contact.replies?.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 24, fontSize: '0.875rem' }}>
            No replies yet. Write one below.
          </div>
        )}
      </div>

      {/* ── Reply box ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 16,
        padding: 16,
      }}>
        <TextArea
          rows={4}
          placeholder={`Reply to ${contact.name}...`}
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          disabled={sending}
          onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleSend(); }}
          style={{ resize: 'none', marginBottom: 10, borderRadius: 10 }}
          autoFocus
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            Ctrl+Enter to send · will be delivered to {contact.email}
          </Text>
          <Button
            type="primary" icon={<SendOutlined />}
            loading={sending} disabled={!replyText.trim()}
            onClick={handleSend}
            style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', border: 'none', borderRadius: 8 }}
          >
            Send Reply
          </Button>
        </div>
      </div>

    </motion.div>
  );
};

export default AdminMessageDetail;
