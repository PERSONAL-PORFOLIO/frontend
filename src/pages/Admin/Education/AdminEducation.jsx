import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, App } from 'antd';
import dayjs from 'dayjs';
import useFetch from '@/hooks/useFetch';
import { educationService } from '@/services/api';
import CrudTable from '@/components/admin/CrudTable';

const AdminEducation = () => {
  const { message } = App.useApp();
  const { data, loading, refetch } = useFetch(educationService.getAll);
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    const payload = {
      ...values,
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.toISOString() || null,
    };
    try {
      if (editing) { await educationService.update(editing._id, payload); message.success('Updated'); }
      else { await educationService.create(payload); message.success('Created'); }
      setModalOpen(false);
      refetch();
    } catch { message.error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { await educationService.delete(id); refetch(); };

  const columns = [
    { title: 'Degree', dataIndex: 'degree', key: 'degree', render: v => <span style={{ color: 'var(--color-heading)', fontWeight: 600 }}>{v}</span> },
    { title: 'School', dataIndex: 'school', key: 'school' },
    { title: 'Field', dataIndex: 'field', key: 'field' },
    { title: 'Period', key: 'period', render: (_, r) => `${new Date(r.startDate).getFullYear()} – ${r.endDate ? new Date(r.endDate).getFullYear() : 'Present'}` },
  ];

  return (
    <>
      <CrudTable title="Education" data={data} loading={loading} columns={columns} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} />
      <Modal
        open={modalOpen} onCancel={() => setModalOpen(false)}
        title={<span style={{ color: 'var(--color-heading)' }}>{editing ? 'Edit Education' : 'Add Education'}</span>}
        footer={null}
        styles={{ content: { background: 'var(--bg-card)' }, header: { background: 'var(--bg-card)', borderBottom: '1px solid rgba(99,102,241,0.2)' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="school" label={<span style={{ color: 'var(--color-text-muted)' }}>School / University</span>} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="degree" label={<span style={{ color: 'var(--color-text-muted)' }}>Degree</span>} rules={[{ required: true }]}>
            <Input placeholder="Bachelor of Science" />
          </Form.Item>
          <Form.Item name="field" label={<span style={{ color: 'var(--color-text-muted)' }}>Field of Study</span>}>
            <Input placeholder="Computer Science" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="startDate" label={<span style={{ color: 'var(--color-text-muted)' }}>Start Date</span>} rules={[{ required: true }]}>
              <DatePicker picker="month" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="endDate" label={<span style={{ color: 'var(--color-text-muted)' }}>End Date</span>}>
              <DatePicker picker="month" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: 'var(--color-text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', borderRadius: 8, color: 'var(--color-heading)', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AdminEducation;
