import React, { useEffect, useState } from 'react';
import { Form, Input, Button, App, Typography, Spin, Row, Col, Upload, Avatar } from 'antd';
import { motion } from 'framer-motion';
import { UploadOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons';
import { profileService, uploadService } from '@/services/api';

const { TextArea } = Input;

const AdminProfile = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await profileService.get();
        if (data.data) {
          form.setFieldsValue(data.data);
          if (data.data.avatar) setAvatarUrl(data.data.avatar);
        }
      } catch (_e) { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [form]);

  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const { data } = await uploadService.upload(file);
      setAvatarUrl(data.url);
      form.setFieldValue('avatar', data.url);
      message.success('Photo uploaded successfully');
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
    try {
      await profileService.update(values);
      message.success('Profile updated');
    } catch {
      message.error('Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Typography.Title level={4} style={{ color: 'var(--color-heading)', marginBottom: 24 }}>Edit Profile</Typography.Title>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, padding: 24 }}>
          <Form form={form} layout="vertical" onFinish={handleSave}>

            {/* ── Photo Upload ─────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, padding: 20, background: 'rgba(99,102,241,0.05)', borderRadius: 12, border: '1px dashed rgba(99,102,241,0.3)' }}>
              <div style={{ position: 'relative' }}>
                <Avatar
                  size={90}
                  src={avatarUrl}
                  icon={!avatarUrl && <UserOutlined />}
                  style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', border: '3px solid rgba(99,102,241,0.4)' }}
                />
                {uploading && (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingOutlined style={{ color: 'var(--color-heading)' }} />
                  </div>
                )}
              </div>
              <div>
                <p style={{ color: 'var(--color-heading)', fontWeight: 600, marginBottom: 4 }}>Professional Photo</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>JPG, PNG, WebP — max 5 MB</p>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  customRequest={handleAvatarUpload}
                >
                  <Button icon={<UploadOutlined />} loading={uploading}
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: 'var(--color-primary-light)', borderRadius: 8 }}>
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </Upload>
              </div>
              {/* Hidden form field to store avatar URL */}
              <Form.Item name="avatar" hidden><Input /></Form.Item>
            </div>

            {/* ── Basic Info ───────────────────────── */}
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item name="fullName" label={<span style={{ color: 'var(--color-text-muted)' }}>Full Name</span>} rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="title" label={<span style={{ color: 'var(--color-text-muted)' }}>Professional Title</span>} rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="summary" label={<span style={{ color: 'var(--color-text-muted)' }}>Bio / Summary</span>}>
                  <TextArea rows={5} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="location" label={<span style={{ color: 'var(--color-text-muted)' }}>Location</span>}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="email" label={<span style={{ color: 'var(--color-text-muted)' }}>Email</span>}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="phone" label={<span style={{ color: 'var(--color-text-muted)' }}>Phone</span>}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="resumeUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>Resume URL</span>}>
                  <Input size="large" placeholder="https://..." />
                </Form.Item>
              </Col>
            </Row>

            {/* ── Social Links ─────────────────────── */}
            <div style={{ margin: '8px 0 20px', paddingTop: 20, borderTop: '1px solid rgba(99,102,241,0.15)' }}>
              <Typography.Text style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Social & Links</Typography.Text>
            </div>
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item name="githubUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>GitHub</span>}>
                  <Input size="large" placeholder="https://github.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="linkedinUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>LinkedIn</span>}>
                  <Input size="large" placeholder="https://linkedin.com/in/..." />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="twitterUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>Twitter / X</span>}>
                  <Input size="large" placeholder="https://x.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="facebookUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>Facebook</span>}>
                  <Input size="large" placeholder="https://facebook.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="instagramUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>Instagram</span>}>
                  <Input size="large" placeholder="https://instagram.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="youtubeUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>YouTube</span>}>
                  <Input size="large" placeholder="https://youtube.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="websiteUrl" label={<span style={{ color: 'var(--color-text-muted)' }}>Personal Website</span>}>
                  <Input size="large" placeholder="https://timbin.dev" />
                </Form.Item>
              </Col>
            </Row>

            <Button type="primary" htmlType="submit" size="large" loading={saving}
              style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: 10, fontWeight: 600, paddingInline: 32 }}>
              Save Changes
            </Button>
          </Form>
        </div>
      )}
    </motion.div>
  );
};

export default AdminProfile;
