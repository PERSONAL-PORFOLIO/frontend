import React from 'react';
import { Table, Button, Popconfirm, App, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const CrudTable = ({
  title,
  data,
  loading,
  columns,
  onAdd,
  onEdit,
  onDelete,
  extraActions,
}) => {
  const { message } = App.useApp();
  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      message.success('Deleted successfully');
    } catch {
      message.error('Delete failed');
    }
  };

  const actionCol = {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render: (_, record) => (
      <Space>
        {extraActions?.(record)}
        <Button
          size="small" type="text" icon={<EditOutlined />}
          style={{ color: 'var(--color-primary-light)' }}
          onClick={() => onEdit(record)}
        />
        <Popconfirm title="Delete this item?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
          <Button size="small" type="text" icon={<DeleteOutlined />} danger />
        </Popconfirm>
      </Space>
    ),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>{title}</Typography.Title>
        <Button
          type="primary" icon={<PlusOutlined />}
          onClick={onAdd}
          style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          Add New
        </Button>
      </div>

      <Table
        dataSource={data || []}
        columns={[...columns, actionCol]}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        style={{ background: 'transparent' }}
        scroll={{ x: true }}
      />
    </motion.div>
  );
};

export default CrudTable;
