import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, App, Upload, Image } from 'antd';
import { UploadOutlined, FileDoneOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useFetch from '@/hooks/useFetch';
import { certificateService, uploadService } from '@/services/api';
import CrudTable from '@/components/admin/CrudTable';

const isPdf = (url) => url && url.toLowerCase().endsWith('.pdf');

const CertPreview = ({ url, size = 80 }) => {
  if (!url) {
    return (
      <div style={{ width: size, height: size * 0.75, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FileDoneOutlined style={{ color: 'var(--color-text-muted)', fontSize: size * 0.35 }} />
      </div>
    );
  }
  if (isPdf(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" title="View PDF" style={{ textDecoration: 'none' }}>
        <div style={{
          width: size, height: size * 0.75, borderRadius: 8,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          <FilePdfOutlined style={{ color: '#ef4444', fontSize: size * 0.35 }} />
          {size >= 60 && <span style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 600 }}>PDF</span>}
        </div>
      </a>
    );
  }
  return (
    <Image
      src={url}
      width={size}
      height={size * 0.75}
      style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)' }}
    />
  );
};

const AdminCertificates = () => {
  const { message } = App.useApp();
  const { data, loading, refetch } = useFetch(certificateService.getAll);
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [certImageUrl, setCertImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setCertImageUrl(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ ...record, issueDate: record.issueDate ? dayjs(record.issueDate) : null });
    setCertImageUrl(record.image || null);
    setModalOpen(true);
  };

  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const { data: res } = await uploadService.upload(file);
      setCertImageUrl(res.url);
      form.setFieldValue('image', res.url);
      message.success('Certificate image uploaded');
      onSuccess?.('ok');
    } catch (err) {
      message.error('Upload failed — check that the backend is running');
      onError?.(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    const payload = { ...values, issueDate: values.issueDate?.toISOString() };
    try {
      if (editing) { await certificateService.update(editing._id, payload); message.success('Updated'); }
      else { await certificateService.create(payload); message.success('Created'); }
      setModalOpen(false);
      refetch();
    } catch { message.error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { await certificateService.delete(id); refetch(); };

  const columns = [
    {
      title: 'File', key: 'image', width: 72,
      render: (_, r) => <CertPreview url={r.image} size={48} />,
    },
    { title: 'Title', dataIndex: 'title', key: 'title', render: v => <span style={{ color: 'var(--color-heading)', fontWeight: 600 }}>{v}</span> },
    { title: 'Issuer', dataIndex: 'issuer', key: 'issuer' },
    { title: 'Issue Date', dataIndex: 'issueDate', key: 'issueDate', render: v => v ? new Date(v).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' },
  ];

  return (
    <>
      <CrudTable title="Certificates" data={data} loading={loading} columns={columns} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} />

      <Modal
        open={modalOpen} onCancel={() => setModalOpen(false)}
        title={<span style={{ color: 'var(--color-heading)' }}>{editing ? 'Edit Certificate' : 'Add Certificate'}</span>}
        footer={null}
        styles={{ content: { background: 'var(--bg-card)' }, header: { background: 'var(--bg-card)', borderBottom: '1px solid rgba(99,102,241,0.2)' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>

          {/* ── Certificate File Upload ──────────── */}
          <Form.Item label={<span style={{ color: 'var(--color-text-muted)' }}>Certificate File</span>}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(99,102,241,0.05)', borderRadius: 10, border: '1px dashed rgba(99,102,241,0.3)' }}>
              <CertPreview url={certImageUrl} size={80} />
              <div>
                <Upload
                  accept="image/*,.pdf,application/pdf"
                  showUploadList={false}
                  customRequest={handleImageUpload}
                >
                  <button
                    type="button"
                    disabled={uploading}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 8, color: 'var(--color-primary-light)', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    <UploadOutlined /> {uploading ? 'Uploading...' : certImageUrl ? 'Change File' : 'Upload File'}
                  </button>
                </Upload>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 6 }}>
                  {isPdf(certImageUrl)
                    ? '✓ PDF uploaded — click preview to open'
                    : 'JPG, PNG, WebP or PDF — max 5 MB'}
                </p>
              </div>
            </div>
          </Form.Item>
          <Form.Item name="image" hidden><Input /></Form.Item>

          <Form.Item name="title" label={<span style={{ color: 'var(--color-text-muted)' }}>Certificate Title</span>} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="issuer" label={<span style={{ color: 'var(--color-text-muted)' }}>Issuing Organization</span>} rules={[{ required: true }]}>
            <Input placeholder="e.g. Udemy, Coursera, AWS" />
          </Form.Item>
          <Form.Item name="issueDate" label={<span style={{ color: 'var(--color-text-muted)' }}>Issue Date</span>} rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="credentialUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>Credential URL</span>}>
            <Input placeholder="https://..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: 'var(--color-text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: 'none', borderRadius: 8, color: 'var(--color-heading)', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AdminCertificates;
