import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, App, Tag } from 'antd';
import useFetch from '../../../hooks/useFetch';
import { skillService } from '../../../services/api';
import CrudTable from '../../../components/admin/CrudTable';
import IconUpload from '../../../components/admin/IconUpload';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Mobile', 'DevOps', 'Other'];
const catColors = {
  Frontend: 'blue', Backend: 'cyan', Database: 'green',
  Mobile: 'orange', DevOps: 'red', Other: 'purple',
};

/* Normalise a skill record — handle both old (category:String) and new (categories:[]) */
const getCategories = (record) => {
  if (Array.isArray(record.categories) && record.categories.length) return record.categories;
  if (record.category) return [record.category];
  return ['Other'];
};

const AdminSkills = () => {
  const { message } = App.useApp();
  const { data, loading, refetch } = useFetch(skillService.getAll);
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [iconUrl, setIconUrl] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setIconUrl(null);
    form.resetFields();
    form.setFieldsValue({ categories: ['Other'] });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setIconUrl(record.iconUrl || null);
    form.setFieldsValue({
      ...record,
      categories: getCategories(record),
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        categories: values.categories || ['Other'],
        iconUrl: iconUrl || null,
      };
      if (editing) {
        await skillService.update(editing._id, payload);
        message.success('Skill updated');
      } else {
        await skillService.create(payload);
        message.success('Skill created');
      }
      setModalOpen(false);
      refetch();
    } catch {
      message.error('Operation failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await skillService.delete(id);
    refetch();
  };

  const columns = [
    {
      title: 'Icon', dataIndex: 'iconUrl', key: 'iconUrl', width: 56,
      render: (url, record) => url
        ? <img src={url} alt={record.name} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />
        : <span style={{ fontSize: 20 }}>{record.icon || '⚡'}</span>,
    },
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: v => <span style={{ color: 'var(--color-heading)', fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Categories', key: 'categories',
      render: (_, record) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {getCategories(record).map(c => (
            <Tag key={c} color={catColors[c] || 'default'}>{c}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Level', dataIndex: 'level', key: 'level',
      render: v => <span style={{ color: 'var(--color-primary-light)' }}>{v}%</span>,
    },
  ];

  return (
    <>
      <CrudTable
        title="Skills"
        data={data} loading={loading} columns={columns}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete}
      />
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={<span style={{ color: 'var(--color-heading)' }}>{editing ? 'Edit Skill' : 'Add Skill'}</span>}
        footer={null}
        styles={{
          content: { background: 'var(--bg-card)' },
          header: { background: 'var(--bg-card)', borderBottom: '1px solid rgba(99,102,241,0.2)' },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label={<span style={{ color: 'var(--color-text-muted)' }}>Skill Name</span>} rules={[{ required: true }]}>
            <Input placeholder="e.g. ColdFusion" />
          </Form.Item>

          <Form.Item
            name="categories"
            label={<span style={{ color: 'var(--color-text-muted)' }}>Categories <span style={{ opacity: 0.55, fontSize: '0.8rem' }}>(select one or more)</span></span>}
            rules={[{ required: true, message: 'Select at least one category' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select categories..."
              options={CATEGORIES.map(c => ({
                value: c,
                label: <Tag color={catColors[c]} style={{ margin: 0 }}>{c}</Tag>,
              }))}
              tagRender={({ label, value, closable, onClose }) => (
                <Tag color={catColors[value] || 'default'} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                  {value}
                </Tag>
              )}
            />
          </Form.Item>

          <Form.Item name="level" label={<span style={{ color: 'var(--color-text-muted)' }}>Proficiency (0–100)</span>} rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label={<span style={{ color: 'var(--color-text-muted)' }}>Icon</span>}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: 6 }}>Image / SVG upload</div>
                <IconUpload value={iconUrl} onChange={setIconUrl} size={64} placeholder="Upload icon" />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: 6 }}>
                  Emoji fallback <span style={{ opacity: 0.55 }}>(shown if no image)</span>
                </div>
                <Form.Item name="icon" noStyle>
                  <Input placeholder="e.g. ⚡" />
                </Form.Item>
              </div>
            </div>
          </Form.Item>

          <Form.Item name="order" label={<span style={{ color: 'var(--color-text-muted)' }}>Display Order</span>}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

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

export default AdminSkills;
