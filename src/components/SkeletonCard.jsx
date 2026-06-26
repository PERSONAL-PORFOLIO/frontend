import React from 'react';

/* Animated shimmer pulse */
const pulse = {
  background: 'linear-gradient(90deg, rgba(99,102,241,0.06) 25%, rgba(99,102,241,0.12) 50%, rgba(99,102,241,0.06) 75%)',
  backgroundSize: '200% 100%',
  animation: 'sk-shimmer 1.4s infinite',
  borderRadius: 8,
};

const Line = ({ w = '100%', h = 14, mb = 0, radius = 8 }) => (
  <div style={{ ...pulse, width: w, height: h, marginBottom: mb, borderRadius: radius }} />
);

/* ── Card skeleton (used on Projects, Certificates) */
export const CardSkeleton = () => (
  <div style={{
    background: 'var(--bg-card)', borderRadius: 16,
    border: '1px solid rgba(99,102,241,0.1)',
    overflow: 'hidden', padding: 0,
  }}>
    {/* Top colour strip */}
    <div style={{ ...pulse, height: 5, borderRadius: 0 }} />
    <div style={{ padding: '24px 24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ ...pulse, width: 50, height: 50, borderRadius: 13 }} />
        <div style={{ ...pulse, width: 70, height: 24, borderRadius: 20 }} />
      </div>
      <Line w="60%" h={18} mb={10} />
      <Line w="100%" h={12} mb={6} />
      <Line w="85%" h={12} mb={6} />
      <Line w="70%" h={12} mb={20} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Line w={60} h={24} radius={20} />
        <Line w={70} h={24} radius={20} />
        <Line w={50} h={24} radius={20} />
      </div>
    </div>
  </div>
);

/* ── Row skeleton (used on Skills, Education, Experience) */
export const RowSkeleton = ({ lines = 2 }) => (
  <div style={{
    background: 'var(--bg-card)', borderRadius: 14,
    border: '1px solid rgba(99,102,241,0.08)',
    padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start',
  }}>
    <div style={{ ...pulse, width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <Line w="45%" h={16} mb={10} />
      {Array.from({ length: lines }).map((_, i) => (
        <Line key={i} w={i === lines - 1 ? '65%' : '90%'} h={12} mb={i < lines - 1 ? 6 : 0} />
      ))}
    </div>
    <div style={{ ...pulse, width: 64, height: 28, borderRadius: 20 }} />
  </div>
);

/* ── Skill pill skeleton */
export const PillSkeleton = ({ count = 8 }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ ...pulse, height: 36, width: [80, 100, 70, 90, 110, 75, 95, 85][i % 8], borderRadius: 20 }} />
    ))}
  </div>
);

/* ── Stat card skeleton */
export const StatSkeleton = ({ count = 3 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 16 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        background: 'var(--bg-card)', borderRadius: 14,
        border: '1px solid rgba(99,102,241,0.08)',
        padding: '24px 20px', textAlign: 'center',
      }}>
        <div style={{ ...pulse, width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px' }} />
        <Line w="50%" h={28} mb={8} radius={6} />
        <Line w="70%" h={11} radius={6} />
      </div>
    ))}
  </div>
);

export const skeletonStyle = `
  @keyframes sk-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export default CardSkeleton;
