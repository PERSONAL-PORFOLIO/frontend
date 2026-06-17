import React, { useState } from 'react';
import { Modal, Form, Input, Switch, App, Tag } from 'antd';
import { StarFilled, ProjectOutlined } from '@ant-design/icons';
import useFetch from '../../../hooks/useFetch';
import { projectService } from '../../../services/api';
import CrudTable from '../../../components/admin/CrudTable';
import IconUpload from '../../../components/admin/IconUpload';

const { TextArea } = Input;

const AdminProjects = () => {
  const { message } = App.useApp();
  const { data, loading, refetch } = useFetch(projectService.getAll);
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setLogo(null);
    form.resetFields();
    form.setFieldsValue({ featured: false });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setLogo(record.logo || null);
    form.setFieldsValue({ ...record, technologies: record.technologies?.join(', ') });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    const payload = {
      ...values,
      logo: logo || null,
      technologies: values.technologies ? values.technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    try {
      if (editing) { await projectService.update(editing._id, payload); message.success('Updated'); }
      else { await projectService.create(payload); message.success('Created'); }
      setModalOpen(false);
      refetch();
    } catch { message.error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { await projectService.delete(id); refetch(); };

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 56,
      render: (url, record) => url
        ? <img src={url} alt={record.title} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />
        : <ProjectOutlined style={{ fontSize: 20, color: '#6366f1' }} />,
    },
    { title: 'Title', dataIndex: 'title', key: 'title', render: v => <span style={{ color: 'var(--color-heading)', fontWeight: 600 }}>{v}</span> },
    { title: 'Featured', dataIndex: 'featured', key: 'featured', render: v => v ? <StarFilled style={{ color: '#f59e0b' }} /> : '—' },
    { title: 'Technologies', dataIndex: 'technologies', key: 'technologies', render: techs => techs?.slice(0, 3).map(t => <Tag key={t} color="blue">{t}</Tag>) },
  ];

  return (
    <>
      <CrudTable title="Projects" data={data} loading={loading} columns={columns} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} />
      <Modal
        open={modalOpen} onCancel={() => setModalOpen(false)}
        title={<span style={{ color: 'var(--color-heading)' }}>{editing ? 'Edit Project' : 'Add Project'}</span>}
        footer={null} width={640}
        styles={{ content: { background: 'var(--bg-card)' }, header: { background: 'var(--bg-card)', borderBottom: '1px solid rgba(99,102,241,0.2)' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="title" label={<span style={{ color: 'var(--color-text-muted)' }}>Title</span>} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={<span style={{ color: 'var(--color-text-muted)' }}>Description</span>}>
            <TextArea rows={3} />
          </Form.Item>

          {/* Project logo upload */}
          <Form.Item label={<span style={{ color: 'var(--color-text-muted)' }}>Project Logo / Icon</span>}>
            <IconUpload value={logo} onChange={setLogo} size={64} placeholder="Upload logo" />
            {logo && (
              <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#10b981' }}>
                Logo uploaded — shown on the projects card.
              </div>
            )}
            <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>
              If no logo, a default icon is shown. PNG, JPG, SVG supported.
            </div>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="githubUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>GitHub URL</span>}>
              <Input placeholder="https://github.com/..." />
            </Form.Item>
            <Form.Item name="demoUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>Demo URL</span>}>
              <Input placeholder="https://..." />
            </Form.Item>
          </div>

          <Form.Item name="image" label={<span style={{ color: 'var(--color-text-muted)' }}>Cover Image URL <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>(screenshot/banner)</span></span>}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="technologies" label={<span style={{ color: 'var(--color-text-muted)' }}>Technologies (comma-separated)</span>}>
            <Input placeholder="React, Node.js, MongoDB" />
          </Form.Item>
          <Form.Item name="featured" label={<span style={{ color: 'var(--color-text-muted)' }}>Featured</span>} valuePropName="checked">
            <Switch />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: 'var(--color-text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AdminProjects;
