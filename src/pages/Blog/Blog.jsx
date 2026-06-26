import SEO from '@/components/SEO';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Result, Button } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, TagOutlined, ReadOutlined } from '@ant-design/icons';
import useFetch from '@/hooks/useFetch';
import { postService } from '@/services/api';
import { CardSkeleton, skeletonStyle } from '@/components/SkeletonCard';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const Blog = () => {
  const navigate = useNavigate();
  const { data: posts, loading, error, refetch } = useFetch(postService.getAll);
  const [activeTag, setActiveTag] = useState('All');

  const allTags = ['All', ...new Set(posts?.flatMap(p => p.tags || []) || [])];
  const filtered = activeTag === 'All' ? posts : posts?.filter(p => p.tags?.includes(activeTag));

  return (
    <div className="section" style={{ paddingTop: 'clamp(16px, 3vw, 48px)' }}>
      <SEO title="Blog" description="Articles and thoughts from Tim on software engineering, tech, and building things." />
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="section-eyebrow" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>Writing</span>
        </div>
        <motion.h1 className="section-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          Blog
        </motion.h1>
        <p className="section-subtitle">Thoughts on software, tools, and building things</p>

        {loading ? (
          <>
            <style>{skeletonStyle}</style>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          </>
        ) : error ? (
          <Result status="error" title="Failed to load posts" extra={<Button type="primary" onClick={refetch}>Retry</Button>} />
        ) : !posts?.length ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
            <ReadOutlined style={{ fontSize: 48, color: 'var(--color-primary-light)', marginBottom: 16 }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No articles published yet — check back soon!</p>
          </motion.div>
        ) : (
          <>
            {/* Tag filter */}
            {allTags.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
                {allTags.map(tag => (
                  <button key={tag} onClick={() => setActiveTag(tag)} style={{
                    padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: '0.82rem',
                    fontWeight: activeTag === tag ? 700 : 400,
                    background: activeTag === tag ? 'linear-gradient(135deg,#6366f1,#06b6d4)' : 'transparent',
                    color: activeTag === tag ? '#fff' : 'var(--color-text-muted)',
                    border: activeTag === tag ? 'none' : '1px solid rgba(99,102,241,0.3)',
                    transition: 'all 0.2s',
                  }}>
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {filtered?.map((post, i) => (
                <motion.article
                  key={post._id}
                  className="glow-card"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  style={{ padding: 28, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  {post.coverImage && (
                    <div style={{ borderRadius: 12, overflow: 'hidden', height: 180 }}>
                      <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tech-tag" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 style={{ color: 'var(--color-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.4 }}>
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0, flex: 1 }}>
                      {post.excerpt}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto', paddingTop: 12,
                    borderTop: '1px solid rgba(99,102,241,0.1)', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarOutlined /> {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ClockCircleOutlined /> {post.readTime} min read
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
