import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select, App, Tag, Rate } from 'antd';
import { StarFilled } from '@ant-design/icons';
import useFetch from '../../../hooks/useFetch';
import { testimonialService } from '../../../services/api';
import CrudTable from '../../../components/admin/CrudTable';
import IconUpload from '../../../components/admin/IconUpload';

const AdminTestimonials = () => {
  const { message } = App.useApp();
  const { data, loading, refetch } = useFetch(testimonialService.getAll);
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setAvatar(null);
    form.resetFields();
    form.setFieldsValue({ rating: 5, featured: false });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setAvatar(record.avatar || null);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, avatar: avatar || '' };
      if (editing) {
        await testimonialService.update(editing._id, payload);
        message.success('Testimonial updated');
      } else {
        await testimonialService.create(payload);
        message.success('Testimonial added');
      }
      setModalOpen(false);
      refetch();
    } catch {
      message.error('Operation failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await testimonialService.delete(id);
    refetch();
  };

  const columns = [
    {
      title: 'Avatar', key: 'avatar', width: 56,
      render: (_, r) => r.avatar
        ? <img src={r.avatar} alt={r.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{r.name?.[0]}</div>,
    },
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (v, r) => (
        <div>
          <div style={{ color: 'var(--color-heading)', fontWeight: 600 }}>{v}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{r.role}{r.company ? ` @ ${r.company}` : ''}</div>
        </div>
      ),
    },
    {
      title: 'Quote', dataIndex: 'quote', key: 'quote',
      render: v => <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>"{v?.slice(0, 60)}{v?.length > 60 ? '…' : ''}"</span>,
    },
    {
      title: 'Rating', dataIndex: 'rating', key: 'rating', width: 110,
      render: v => <Rate disabled defaultValue={v} style={{ fontSize: 13 }} />,
    },
    {
      title: 'Featured', dataIndex: 'featured', key: 'featured', width: 90,
      render: v => v ? <Tag color="gold">Featured</Tag> : <Tag>Normal</Tag>,
    },
  ];

  return (
    <>
      <CrudTable
        title="Testimonials"
        data={data} loading={loading} columns={columns}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete}
      />
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={<span style={{ color: 'var(--color-heading)' }}>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</span>}
        footer={null}
        styles={{
          content: { background: 'var(--bg-card)' },
          header: { background: 'var(--bg-card)', borderBottom: '1px solid rgba(99,102,241,0.2)' },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>Avatar</div>
              <IconUpload value={avatar} onChange={setAvatar} size={64} placeholder="Photo" circle />
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="name" label={<span style={{ color: 'var(--color-text-muted)' }}>Full Name</span>} rules={[{ required: true }]}>
                <Input placeholder="Jane Smith" />
              </Form.Item>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="role" label={<span style={{ color: 'var(--color-text-muted)' }}>Role</span>}>
              <Input placeholder="Lead Engineer" />
            </Form.Item>
            <Form.Item name="company" label={<span style={{ color: 'var(--color-text-muted)' }}>Company</span>}>
              <Input placeholder="Acme Corp" />
            </Form.Item>
          </div>

          <Form.Item name="quote" label={<span style={{ color: 'var(--color-text-muted)' }}>Quote</span>} rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Tim is an exceptional developer who..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Form.Item name="rating" label={<span style={{ color: 'var(--color-text-muted)' }}>Rating</span>}>
              <InputNumber min={1} max={5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="order" label={<span style={{ color: 'var(--color-text-muted)' }}>Order</span>}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="featured" label={<span style={{ color: 'var(--color-text-muted)' }}>Featured</span>} valuePropName="checked">
              <Switch style={{ background: undefined }} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={() => setModalOpen(false)}
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AdminTestimonials;
