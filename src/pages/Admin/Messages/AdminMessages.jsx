import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Popconfirm, App, Badge, Typography, Tag, Space, Tooltip } from 'antd';
import { DeleteOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useFetch from '@/hooks/useFetch';
import { contactService } from '@/services/api';

const AdminMessages = () => {
  const { message } = App.useApp();
  const { data, loading, refetch } = useFetch(contactService.getAll);
  const navigate = useNavigate();

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
      render: (v, r) => (
        <span
          style={{ color: 'var(--color-heading)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => navigate(`/admin/messages/${r._id}`)}
        >
          {v}
        </span>
      ),
    },
    {
      title: 'Email', dataIndex: 'email', key: 'email',
      render: v => <a href={`mailto:${v}`} style={{ color: 'var(--color-primary-light)' }}>{v}</a>,
    },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    {
      title: 'Replies', key: 'replies', width: 80,
      render: (_, r) => (r.replies?.length || 0) > 0
        ? <Tag color="blue">{r.replies.length} sent</Tag>
        : <span style={{ color: 'var(--color-text-muted)' }}>—</span>,
    },
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: v => new Date(v).toLocaleDateString() },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="View & Reply">
            <Button size="small" type="text" icon={<EyeOutlined />}
              style={{ color: 'var(--color-primary-light)' }}
              onClick={() => navigate(`/admin/messages/${record._id}`)} />
          </Tooltip>
          <Tooltip title="Quick Reply">
            <Button size="small" type="text" icon={<SendOutlined />}
              style={{ color: '#06b6d4' }}
              onClick={() => navigate(`/admin/messages/${record._id}`)} />
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
        onRow={(r) => ({ onClick: (e) => { if (!e.target.closest('button, a')) navigate(`/admin/messages/${r._id}`); }, style: { cursor: 'pointer' } })}
        scroll={{ x: true }}
      />

      <style>{'.unread-row td { background: rgba(99,102,241,0.05) !important; }'}</style>
    </motion.div>
  );
};

export default AdminMessages;
