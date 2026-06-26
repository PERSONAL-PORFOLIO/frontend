import React, { useState } from 'react';
import { Table, Button, Popconfirm, App, Badge, Modal, Typography, Tag, Space, Input, Form, Tooltip } from 'antd';
import { DeleteOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useFetch from '@/hooks/useFetch';
import { contactService } from '@/services/api';

const { TextArea } = Input;

const AdminMessages = () => {
  const { message } = App.useApp();
  const { data, loading, refetch } = useFetch(contactService.getAll);
  const [viewing, setViewing] = useState(null);
  const [replying, setReplying] = useState(null); // message being replied to
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const handleView = async (record) => {
    setViewing(record);
    if (!record.read) {
      try {
        await contactService.markRead(record._id);
        refetch();
      } catch (_e) { /* ignore */ }
    }
  };

  const handleOpenReply = (record) => {
    setReplying(record);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await contactService.reply(replying._id, { replyMessage: replyText });
      message.success(`Reply sent to ${replying.email}`);
      setReplying(null);
      setReplyText('');
      refetch();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await contactService.delete(id);
      message.success('Message deleted');
      refetch();
    } catch {
      message.error('Delete failed');
    }
  };

  const unread = data?.filter(c => !c.read).length || 0;

  const columns = [
    {
      title: 'Status', key: 'read', width: 80,
      render: (_, r) => r.read
        ? <Tag color="default">Read</Tag>
        : <Badge status="processing" text={<span style={{ color: '#6366f1', fontWeight: 600 }}>New</span>} />,
    },
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: v => <span style={{ color: 'var(--color-heading)', fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Email', dataIndex: 'email', key: 'email',
      render: v => <a href={`mailto:${v}`} style={{ color: 'var(--color-primary-light)' }}>{v}</a>,
    },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: v => new Date(v).toLocaleDateString() },
    {
      title: 'Actions', key: 'actions', width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button size="small" type="text" icon={<EyeOutlined />}
              style={{ color: 'var(--color-primary-light)' }}
              onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Reply">
            <Button size="small" type="text" icon={<SendOutlined />}
              style={{ color: '#06b6d4' }}
              onClick={() => handleOpenReply(record)} />
          </Tooltip>
          <Popconfirm title="Delete this message?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
            <Tooltip title="Delete">
              <Button size="small" type="text" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const modalBodyStyle = { background: 'var(--bg-card)' };
  const modalHeaderStyle = { background: 'var(--bg-card)', borderBottom: '1px solid rgba(99,102,241,0.2)' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Typography.Title level={4} style={{ color: 'var(--color-heading)', margin: 0 }}>Messages</Typography.Title>
        {unread > 0 && <Badge count={unread} style={{ background: 'var(--color-primary)' }} />}
      </div>

      <Table
        dataSource={data || []}
        columns={columns}
        rowKey="_id"
        loading={loading}
        rowClassName={(r) => r.read ? '' : 'unread-row'}
        scroll={{ x: true }}
      />

      {/* ── View modal ── */}
      <Modal
        open={!!viewing}
        onCancel={() => setViewing(null)}
        footer={[
          <Button key="reply" type="primary" icon={<SendOutlined />}
            style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', border: 'none' }}
            onClick={() => { setViewing(null); handleOpenReply(viewing); }}>
            Reply
          </Button>,
          <Button key="close" onClick={() => setViewing(null)}>Close</Button>,
        ]}
        title={<span style={{ color: 'var(--color-heading)' }}>Message from {viewing?.name}</span>}
        styles={{ content: modalBodyStyle, header: modalHeaderStyle }}
      >
        {viewing && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>FROM</span>
              <p style={{ color: 'var(--color-text)', margin: '4px 0' }}>
                {viewing.name} &lt;{viewing.email}&gt;
              </p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>SUBJECT</span>
              <p style={{ color: 'var(--color-text)', margin: '4px 0', fontWeight: 600 }}>{viewing.subject}</p>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>MESSAGE</span>
              <p style={{ color: 'var(--color-text)', margin: '4px 0', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {viewing.message}
              </p>
            </div>
            <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Received: {new Date(viewing.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reply modal ── */}
      <Modal
        open={!!replying}
        onCancel={() => !sending && setReplying(null)}
        closable={!sending}
        title={
          <span style={{ color: 'var(--color-heading)' }}>
            Reply to <span style={{ color: '#6366f1' }}>{replying?.name}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: 8 }}>
              &lt;{replying?.email}&gt;
            </span>
          </span>
        }
        styles={{ content: modalBodyStyle, header: modalHeaderStyle }}
        footer={[
          <Button key="cancel" onClick={() => setReplying(null)} disabled={sending}>Cancel</Button>,
          <Button key="send" type="primary" icon={<SendOutlined />} loading={sending}
            disabled={!replyText.trim()}
            style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', border: 'none' }}
            onClick={handleSendReply}>
            Send Reply
          </Button>,
        ]}
        width={600}
      >
        {replying && (
          <div style={{ paddingTop: 8 }}>
            {/* Original message thread */}
            <div style={{
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                ORIGINAL MESSAGE · {new Date(replying.createdAt).toLocaleString()}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--color-heading)', marginBottom: 4 }}>
                {replying.subject}
              </div>
              <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {replying.message}
              </div>
            </div>

            {/* Reply input */}
            <Form.Item style={{ margin: 0 }}>
              <TextArea
                rows={7}
                placeholder={`Type your reply to ${replying.name}...`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                disabled={sending}
                style={{ resize: 'vertical' }}
                autoFocus
              />
              <div style={{ textAlign: 'right', marginTop: 4, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Will be sent to: {replying.email}
              </div>
            </Form.Item>
          </div>
        )}
      </Modal>

      <style>{'.unread-row td { background: rgba(99,102,241,0.05) !important; }'}</style>
    </motion.div>
  );
};

export default AdminMessages;
