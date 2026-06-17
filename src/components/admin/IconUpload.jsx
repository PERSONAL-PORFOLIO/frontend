import React, { useState } from 'react';
import { App } from 'antd';
import { UploadOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { uploadService } from '@/services/api';

/**
 * IconUpload
 * A compact upload widget for skill icons / project logos.
 *
 * Props:
 *   value       – current URL string (controlled)
 *   onChange    – called with new URL (or null when cleared)
 *   size        – pixel size of the preview box (default 56)
 *   placeholder – text shown inside empty box (default 'Upload')
 *   accept      – file input accept string (default 'image/*,.svg')
 */
const IconUpload = ({
  value,
  onChange,
  size = 56,
  placeholder = 'Upload icon',
  accept = 'image/*,.svg',
}) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2 MB limit for icons
    if (file.size > 2 * 1024 * 1024) {
      message.error('File too large — max 2 MB for icons');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadService.upload(file);
      onChange?.(res.data.url);
      message.success('Icon uploaded');
    } catch {
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const boxStyle = {
    width: size, height: size,
    borderRadius: 10,
    border: '1.5px dashed rgba(99,102,241,0.4)',
    background: value ? 'transparent' : 'rgba(99,102,241,0.04)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    transition: 'border-color 0.2s, background 0.2s',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Preview / trigger box */}
      <label style={{ ...boxStyle, cursor: uploading ? 'not-allowed' : 'pointer' }}>
        <input
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={handleFile}
          disabled={uploading}
        />

        {uploading ? (
          <LoadingOutlined style={{ fontSize: 20, color: '#6366f1' }} />
        ) : value ? (
          <img
            src={value}
            alt="icon"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 4 }}>
            <UploadOutlined style={{ fontSize: 18, color: 'rgba(99,102,241,0.6)', display: 'block', marginBottom: 2 }} />
            <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', lineHeight: 1.2, display: 'block' }}>
              {placeholder}
            </span>
          </div>
        )}

        {/* Hover overlay when image exists */}
        {value && !uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
          className="icon-upload-overlay"
          >
            <UploadOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
        )}
      </label>

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={clear}
          title="Remove icon"
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13,
          }}
        >
          <DeleteOutlined />
        </button>
      )}

      <style>{`
        label:hover .icon-upload-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default IconUpload;
