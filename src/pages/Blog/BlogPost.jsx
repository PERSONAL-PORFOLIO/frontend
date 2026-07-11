import SEO from '@/components/SEO';
import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Spin, Result, Button } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined, EyeOutlined, LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import useFetch from '@/hooks/useFetch';
import { postService } from '@/services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

/* Shared image protection props — disables right-click, drag, and selection */
const imgProtect = {
  onContextMenu: (e) => e.preventDefault(),
  onDragStart: (e) => e.preventDefault(),
  draggable: false,
  style: { userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' },
};

/* Wrapper that adds a transparent overlay so the img itself is non-interactive */
const ProtectedImg = ({ src, alt, style, wrapStyle }) => (
  <div style={{ position: 'relative', display: 'block', ...wrapStyle }}>
    <img src={src} alt={alt} {...imgProtect} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'inherit', objectPosition: 'inherit', ...imgProtect.style, ...style }} />
    {/* Transparent overlay blocks right-click / drag on the image element */}
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, userSelect: 'none' }}
      onContextMenu={e => e.preventDefault()}
      onDragStart={e => e.preventDefault()}
    />
  </div>
);

/* ── Extract all <img> from HTML, replace with placeholders ── */
const parseContent = (html) => {
  const images = [];
  const imgRegex = /<img[^>]+src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    images.push({ src: match[1], alt: match[2] || '' });
  }
  const stripped = html.replace(/<img[^>]*\/?>/gi, '[[IMAGE_SLIDER]]');
  // Only keep one placeholder (all images → one slider)
  const parts = stripped.split('[[IMAGE_SLIDER]]').filter((p, i) => i === 0 || p !== '');
  const segments = [];
  let imageInserted = false;
  for (const part of parts) {
    if (part === '') continue;
    segments.push({ type: 'html', content: part });
    if (!imageInserted && images.length > 0) {
      segments.push({ type: 'slider' });
      imageInserted = true;
    }
  }
  if (!imageInserted && images.length > 0) segments.push({ type: 'slider' });
  return { segments, images };
};

/* ── Lightbox ── */
const Lightbox = ({ images, index, onClose, onPrev, onNext }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>
      <CloseOutlined />
    </button>
    <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position: 'absolute', left: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LeftOutlined />
    </button>
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.stopPropagation()}
      style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
    >
      <ProtectedImg src={images[index]?.src} alt={images[index]?.alt} style={{ objectFit: 'contain', maxWidth: '90vw', maxHeight: '88vh' }} />
    </motion.div>
    <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position: 'absolute', right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RightOutlined />
    </button>
    <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
      {index + 1} / {images.length}
    </div>
  </motion.div>
);

/* ── Image Slider ── */
const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [direction, setDirection] = useState(1);

  const go = useCallback((next) => {
    setDirection(next > current ? 1 : -1);
    setCurrent((next + images.length) % images.length);
  }, [current, images.length]);

  if (!images.length) return null;
  if (images.length === 1) return (
    <div style={{ margin: '1.5em 0', borderRadius: 14, overflow: 'hidden', cursor: 'zoom-in', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={() => setLightbox(true)}>
      <ProtectedImg src={images[0].src} alt={images[0].alt} style={{ objectFit: 'cover' }} wrapStyle={{ width: '100%', aspectRatio: '16/9' }} />
      <AnimatePresence>
        {lightbox && <Lightbox images={images} index={0} onClose={() => setLightbox(false)} onPrev={() => {}} onNext={() => {}} />}
      </AnimatePresence>
    </div>
  );

  return (
    <div style={{ margin: '1.5em 0', borderRadius: 16, overflow: 'hidden', position: 'relative', background: 'rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
      {/* Slides */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', cursor: 'zoom-in', overflow: 'hidden' }} onClick={() => setLightbox(true)}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <ProtectedImg src={images[current].src} alt={images[current].alt}
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              wrapStyle={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Counter badge */}
        <div style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '3px 10px', color: '#fff', fontSize: '0.78rem', backdropFilter: 'blur(4px)' }}>
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Arrows — zIndex 5 keeps them above the ProtectedImg overlay (zIndex 1) */}
      {['prev','next'].map(dir => (
        <button key={dir} onClick={(e) => { e.stopPropagation(); go(dir === 'prev' ? current - 1 : current + 1); }}
          style={{ position: 'absolute', top: '50%', [dir === 'prev' ? 'left' : 'right']: 12, transform: 'translateY(-50%)', zIndex: 5, background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.75)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}
        >
          {dir === 'prev' ? <LeftOutlined /> : <RightOutlined />}
        </button>
      ))}

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, padding: '10px 0 12px' }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => go(i)} style={{ width: i === current ? 22 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', transition: 'all 0.25s', background: i === current ? '#6366f1' : 'rgba(99,102,241,0.25)', padding: 0 }} />
        ))}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px', overflowX: 'auto' }}>
          {images.map((img, i) => (
            <div key={i} onClick={() => go(i)} style={{ flexShrink: 0, width: 56, height: 40, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === current ? '#6366f1' : 'transparent'}`, transition: 'border 0.2s', opacity: i === current ? 1 : 0.55 }}>
              <ProtectedImg src={img.src} alt={img.alt} style={{ objectFit: 'cover' }} wrapStyle={{ width: '100%', height: '100%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            images={images}
            index={current}
            onClose={() => setLightbox(false)}
            onPrev={() => go(current - 1)}
            onNext={() => go(current + 1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: post, loading, error } = useFetch(() => postService.getOne(slug), [slug]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '120px 0' }}><Spin size="large" /></div>
  );

  if (error || !post) return (
    <div style={{ padding: '80px 0' }}>
      <Result status="404" title="Post not found"
        extra={<Button type="primary" onClick={() => navigate('/blog')}>Back to Blog</Button>} />
    </div>
  );

  return (
    <div className="section" style={{ paddingTop: 'clamp(16px, 3vw, 48px)' }}>
      <SEO
        title={post.title}
        description={post.excerpt || post.title}
        image={post.coverImage || undefined}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        type="article"
      />
      <div className="section-inner">

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate('/blog')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 20,
          }}>
            <ArrowLeftOutlined /> Back to Blog
          </button>
        </motion.div>

        {/* Cover image */}
        {post.coverImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 40, boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}>
            <ProtectedImg src={post.coverImage} alt={post.title}
              style={{ objectFit: 'cover', objectPosition: 'center top', minHeight: 200, maxHeight: '42vh' }}
              wrapStyle={{ width: '100%' }}
            />
          </motion.div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {post.tags.map(tag => (
              <span key={tag} className="tech-tag" style={{ fontSize: '0.8rem' }}>{tag}</span>
            ))}
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ color: 'var(--color-heading)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, lineHeight: 1.25, marginBottom: 20 }}
        >
          {post.title}
        </motion.h1>

        {/* Meta */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 20, color: 'var(--color-text-muted)', fontSize: '0.85rem',
            paddingBottom: 24, borderBottom: '1px solid rgba(99,102,241,0.12)', marginBottom: 36 }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined /> {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockCircleOutlined /> {post.readTime} min read
          </span>
          {post.views > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <EyeOutlined /> {post.views} view{post.views !== 1 ? 's' : ''}
            </span>
          )}
        </motion.div>

        {/* Content */}
        {(() => {
          const { segments, images } = parseContent(post.content);
          return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {segments.map((seg, i) =>
                seg.type === 'slider'
                  ? <ImageSlider key={i} images={images} />
                  : <div key={i} className="blog-post-content" dangerouslySetInnerHTML={{ __html: seg.content }} />
              )}
            </motion.div>
          );
        })()}

        {/* Footer nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: 56, paddingTop: 28, borderTop: '1px solid rgba(99,102,241,0.12)', textAlign: 'center' }}
        >
          <Button type="primary" onClick={() => navigate('/blog')}
            style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', border: 'none' }}>
            ← More Articles
          </Button>
        </motion.div>

      </div>

      {/* Blog post content styles */}
      <style>{`
        .blog-post-content {
          color: var(--color-text);
          font-size: 1rem;
          line-height: 1.85;
        }
        .blog-post-content h1,.blog-post-content h2,.blog-post-content h3,
        .blog-post-content h4,.blog-post-content h5,.blog-post-content h6 {
          color: var(--color-heading);
          font-weight: 700;
          margin: 1.8em 0 0.6em;
          line-height: 1.3;
        }
        .blog-post-content h1 { font-size: 1.8rem; }
        .blog-post-content h2 { font-size: 1.4rem; }
        .blog-post-content h3 { font-size: 1.15rem; }
        .blog-post-content p { margin: 0 0 1.2em; }
        .blog-post-content a {
          color: var(--color-primary-light);
          text-decoration: underline;
        }
        .blog-post-content a:hover { opacity: 0.8; }
        .blog-post-content code {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          padding: 2px 7px;
          border-radius: 5px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.88em;
          color: var(--color-primary-light);
        }
        .blog-post-content pre {
          background: rgba(99,102,241,0.07);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 10px;
          padding: 18px 20px;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .blog-post-content pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.9rem;
        }
        .blog-post-content blockquote {
          border-left: 3px solid #6366f1;
          margin: 1.5em 0;
          padding: 12px 20px;
          background: rgba(99,102,241,0.06);
          border-radius: 0 8px 8px 0;
          color: var(--color-text-muted);
          font-style: italic;
        }
        .blog-post-content ul,.blog-post-content ol {
          padding-left: 1.5em;
          margin: 0 0 1.2em;
        }
        .blog-post-content li { margin: 0.4em 0; }
        .blog-post-content img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          margin: 0.5em 0;
          display: block;
        }
        .blog-post-content hr {
          border: none;
          border-top: 1px solid rgba(99,102,241,0.15);
          margin: 2em 0;
        }
        .blog-post-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 0.9rem;
        }
        .blog-post-content th, .blog-post-content td {
          border: 1px solid rgba(99,102,241,0.15);
          padding: 8px 14px;
          text-align: left;
        }
        .blog-post-content th {
          background: rgba(99,102,241,0.1);
          font-weight: 600;
          color: var(--color-heading);
        }
      `}</style>
    </div>
  );
};

export default BlogPost;
