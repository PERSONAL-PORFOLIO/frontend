import React, { useState } from 'react';
import { Table, Button, Popconfirm, App, Badge, Modal, Typography, Tag, Space } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useFetch from '@/hooks/useFetch';
import { contactService } from '@/services/api';

const AdminMessages = () => {
  const { message } = App.useApp();
  const { data, loading, refetch } = useFetch(contactService.getAll);
  const [viewing, setViewing] = useState(null);

  const handleView = async (record) => {
    setViewing(record);
    if (!record.read) {
      try {
        await contactService.markRead(record._id);
        refetch();
      } catch (_e) { /* ignore */ }
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
      render: (_, r) => r.read ? <Tag color="default">Read</Tag> : <Badge status="processing" text={<span style={{ color: '#6366f1', fontWeight: 600 }}>New</span>} />,
    },
    { title: 'Name', dataIndex: 'name', key: 'name', render: v => <span style={{ color: 'var(--color-heading)', fontWeight: 600 }}>{v}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: v => <a href={`mailto:${v}`} style={{ color: 'var(--color-primary-light)' }}>{v}</a> },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: v => new Date(v).toLocaleDateString() },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_, record) => (
        <Space>
          <Button size="small" type="text" icon={<EyeOutlined />} style={{ color: 'var(--color-primary-light)' }} onClick={() => handleView(record)} />
          <Popconfirm title="Delete this message?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
            <Button size="small" type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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

      {/* View Modal */}
      <Modal
        open={!!viewing}
        onCancel={() => setViewing(null)}
        footer={<Button onClick={() => setViewing(null)}>Close</Button>}
        title={<span style={{ color: 'var(--color-heading)' }}>Message from {viewing?.name}</span>}
        styles={{ content: { background: 'var(--bg-card)' }, header: { background: 'var(--bg-card)', borderBottom: '1px solid rgba(99,102,241,0.2)' } }}
      >
        {viewing && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>FROM</span>
              <p style={{ color: 'var(--color-text)', margin: '4px 0' }}>{viewing.name} &lt;{viewing.email}&gt;</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>SUBJECT</span>
              <p style={{ color: 'var(--color-text)', margin: '4px 0', fontWeight: 600 }}>{viewing.subject}</p>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>MESSAGE</span>
              <p style={{ color: 'var(--color-text)', margin: '4px 0', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{viewing.message}</p>
            </div>
            <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Received: {new Date(viewing.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>

      <style>{'.unread-row td { background: rgba(99,102,241,0.05) !important; }'}</style>
    </motion.div>
  );
};

export default AdminMessages;
