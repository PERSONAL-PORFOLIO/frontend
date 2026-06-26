import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Button, Modal, Form, Input, Switch, Tag, Space,
  Popconfirm, notification, Select, Tooltip, Upload, Progress,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined,
  PictureOutlined, VideoCameraOutlined, UploadOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { postService, uploadService } from '@/services/api';
import api from '@/services/api';

const { TextArea } = Input;

/* ── Inline media uploader button ── */
const MediaUploadButton = ({ icon, accept, label, onInsert, notifApi }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${apiBase}/upload`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
      };
      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText);
        if (res.success) {
          onInsert(res.url, file.type);
          notifApi.success({ message: 'Uploaded!', duration: 2 });
        } else {
          notifApi.error({ message: res.message || 'Upload failed' });
        }
        setUploading(false);
        setProgress(0);
        e.target.value = '';
      };
      xhr.onerror = () => {
        notifApi.error({ message: 'Upload failed' });
        setUploading(false);
        e.target.value = '';
      };
      xhr.send(formData);
    } catch {
      notifApi.error({ message: 'Upload failed' });
      setUploading(false);
    }
  };

  return (
    <span>
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFile} />
      <Tooltip title={label}>
        <Button
          size="small"
          icon={uploading ? <LoadingOutlined /> : icon}
          disabled={uploading}
          onClick={() => inputRef.current.click()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          {label}
          {uploading && progress > 0 && ` ${progress}%`}
        </Button>
      </Tooltip>
    </span>
  );
};

/* ── Cover image upload ── */
const CoverUpload = ({ value, onChange, notifApi }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.success) { onChange(data.url); }
      else notifApi.error({ message: data.message || 'Upload failed' });
    } catch {
      notifApi.error({ message: 'Upload failed' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder="https://... or upload below" style={{ flex: 1 }} />
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} disabled={uploading} onClick={() => inputRef.current.click()}>
        {uploading ? 'Uploading…' : 'Upload'}
      </Button>
      {value && (
        <img src={value} alt="cover preview" style={{ height: 36, width: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(99,102,241,0.2)' }} />
      )}
    </div>
  );
};

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [form] = Form.useForm();
  const [notifApi, notifCtx] = notification.useNotification();
  const contentRef = useRef();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postService.getAdmin();
      setPosts(res.data?.data || []);
    } catch {
      notifApi.error({ message: 'Failed to load posts' });
    } finally {
      setLoading(false);
    }
  }, [notifApi]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreate = () => {
    setEditingPost(null);
    setCoverImage('');
    form.resetFields();
    form.setFieldsValue({ published: false, tags: [] });
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setCoverImage(post.coverImage || '');
    form.setFieldsValue({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags || [],
      published: post.published,
    });
    setModalOpen(true);
  };

  // Insert HTML at cursor position in the content textarea
  const insertAtCursor = (html) => {
    const ta = contentRef.current?.resizableTextArea?.textArea;
    if (!ta) {
      // fallback: append
      const cur = form.getFieldValue('content') || '';
      form.setFieldValue('content', cur + '\n' + html);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const cur = form.getFieldValue('content') || '';
    const next = cur.slice(0, start) + '\n' + html + '\n' + cur.slice(end);
    form.setFieldValue('content', next);
    // Move cursor after inserted HTML
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + html.length + 2;
    }, 0);
  };

  const handleMediaInsert = (url, mimeType) => {
    const isVideo = mimeType?.startsWith('video/');
    const html = isVideo
      ? `<video controls style="max-width:100%;border-radius:8px;">\n  <source src="${url}" type="${mimeType}">\n</video>`
      : `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;" />`;
    insertAtCursor(html);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = { ...values, coverImage };
      if (editingPost) {
        await postService.update(editingPost._id, payload);
        notifApi.success({ message: 'Post updated' });
      } else {
        await postService.create(payload);
        notifApi.success({ message: 'Post created' });
      }
      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      if (err?.errorFields) return;
      notifApi.error({ message: err?.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await postService.delete(id);
      notifApi.success({ message: 'Post deleted' });
      fetchPosts();
    } catch {
      notifApi.error({ message: 'Delete failed' });
    }
  };

  const togglePublish = async (post) => {
    try {
      await postService.update(post._id, { published: !post.published });
      fetchPosts();
    } catch {
      notifApi.error({ message: 'Failed to update' });
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-heading)' }}>{title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>/{record.slug}</div>
        </div>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: (tags) => (tags || []).slice(0, 3).map(t => (
        <Tag key={t} color="purple" style={{ marginBottom: 2 }}>{t}</Tag>
      )),
    },
    { title: 'Read time', dataIndex: 'readTime', align: 'center', render: (v) => `${v} min`, width: 90 },
    { title: 'Views', dataIndex: 'views', align: 'center', width: 70 },
    {
      title: 'Status',
      dataIndex: 'published',
      align: 'center',
      width: 100,
      render: (pub, record) => (
        <Tooltip title={pub ? 'Click to unpublish' : 'Click to publish'}>
          <Tag color={pub ? 'green' : 'default'} style={{ cursor: 'pointer' }} onClick={() => togglePublish(record)}>
            {pub ? 'Published' : 'Draft'}
          </Tag>
        </Tooltip>
      ),
    },
    { title: 'Date', render: (_, r) => formatDate(r.publishedAt || r.createdAt), width: 120 },
    {
      title: 'Actions',
      align: 'right',
      width: 130,
      render: (_, record) => (
        <Space>
          {record.published && (
            <Tooltip title="View post">
              <Button size="small" icon={<LinkOutlined />} onClick={() => window.open(`/blog/${record.slug}`, '_blank')} />
            </Tooltip>
          )}
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this post?" onConfirm={() => handleDelete(record._id)} okText="Delete" okType="danger">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {notifCtx}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ color: 'var(--color-heading)', margin: 0 }}>Blog Posts</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 0', fontSize: '0.875rem' }}>
            Write and publish articles visible on your portfolio
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
          style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', border: 'none' }}>
          New Post
        </Button>
      </div>

      <Table
        dataSource={posts} columns={columns} rowKey="_id" loading={loading}
        pagination={{ pageSize: 10, showTotal: (t) => `${t} posts` }}
        scroll={{ x: 700 }}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editingPost ? 'Save Changes' : 'Create Post'}
        confirmLoading={saving}
        title={editingPost ? 'Edit Post' : 'New Post'}
        width={820}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="My awesome article" />
          </Form.Item>

          <Form.Item name="excerpt" label="Excerpt" extra="Short summary shown in the post listing (1–2 sentences)">
            <TextArea rows={2} placeholder="A brief summary of what this post covers…" />
          </Form.Item>

          {/* Cover image with upload */}
          <Form.Item label="Cover Image" extra="Upload an image or paste a URL">
            <CoverUpload value={coverImage} onChange={setCoverImage} notifApi={notifApi} />
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              placeholder="Add tags — press Enter (e.g. React, Node.js, Tutorial)"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>

          {/* Content with media upload toolbar */}
          <Form.Item
            name="content"
            label={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 8 }}>
                <span>Content</span>
                <Space size={6}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Insert:</span>
                  <MediaUploadButton
                    icon={<PictureOutlined />}
                    accept="image/*"
                    label="Image"
                    onInsert={handleMediaInsert}
                    notifApi={notifApi}
                  />
                  <MediaUploadButton
                    icon={<VideoCameraOutlined />}
                    accept="video/*"
                    label="Video"
                    onInsert={handleMediaInsert}
                    notifApi={notifApi}
                  />
                </Space>
              </div>
            }
            extra='Supports HTML — <h2>, <p>, <code>, <pre>, <blockquote>, <ul>. Use the buttons above to insert images/videos.'
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <TextArea
              ref={contentRef}
              rows={16}
              placeholder="<p>Write your article here...</p>"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.85rem' }}
            />
          </Form.Item>

          <Form.Item name="published" label="Published" valuePropName="checked">
            <Switch checkedChildren="Published" unCheckedChildren="Draft" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminBlog;
