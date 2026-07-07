import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://tim-porfolio.vercel.app';

/**
 * Built-in defaults for every public page.
 * These are the fallback when the admin hasn't set a custom title/description.
 * Priority chain (highest → lowest):
 *   1. Explicit prop  (title / description passed directly — e.g. blog post title)
 *   2. Admin pageSeo  (set in Admin → Settings → Per-Page SEO)
 *   3. These defaults (clean, keyword-rich copy per page)
 *   4. Global seoDescription from site settings
 */
const PAGE_DEFAULTS = {
  home: {
    title: null, // no suffix needed — siteTitle alone is fine for home
    description:
      'Software engineer specializing in modern web technologies. Explore my projects, skills, and professional experience.',
  },
  about: {
    title: 'About',
    description:
      'Learn about my background, story, and what drives me as a software engineer building modern web applications.',
  },
  skills: {
    title: 'Skills',
    description:
      'Technical skills across frontend, backend, DevOps, and databases — from React and Vue.js to Node.js, ColdFusion, and more.',
  },
  experience: {
    title: 'Experience',
    description:
      'Professional work experience and career journey in software engineering — roles, responsibilities, and achievements.',
  },
  projects: {
    title: 'Projects',
    description:
      'Software projects built with modern technologies — from full-stack web apps to APIs and internal tools.',
  },
  education: {
    title: 'Education',
    description:
      'Academic background and educational qualifications in computer science and software engineering.',
  },
  certificates: {
    title: 'Certificates',
    description:
      'Professional certifications and completed courses that expand my skills in software development and technology.',
  },
  blog: {
    title: 'Blog',
    description:
      'Articles and thoughts on software engineering, web development, tools, and lessons learned from real projects.',
  },
  contact: {
    title: 'Contact',
    description:
      'Get in touch — open to new opportunities, freelance projects, and collaborations in software engineering.',
  },
};

/**
 * SEO — single source of truth for all page meta tags.
 *
 * Usage (static page):
 *   <SEO pageKey="about" />
 *
 * Usage (dynamic page — blog post, project detail):
 *   <SEO title={post.title} description={post.excerpt} image={post.coverImage} />
 *
 * Props:
 *   pageKey     — key from PAGE_DEFAULTS; auto-reads admin pageSeo overrides
 *   title       — explicit title override (skips admin lookup for title)
 *   description — explicit description override
 *   image       — og:image (defaults to global ogImage or AskTim logo)
 *   url         — canonical URL (defaults to current pathname)
 *   type        — og:type (default: 'website')
 */
const SEO = ({ pageKey, title, description, image, url, type = 'website' }) => {
  const { settings } = useSiteSettings();
  const location     = useLocation();

  const defaults    = PAGE_DEFAULTS[pageKey] || {};
  const adminPage   = settings?.pageSeo?.[pageKey] || {};
  const siteName    = settings?.siteTitle   || "Tim's Portfolio";
  const globalImage = settings?.ogImage     || `${SITE_URL}/asktim-logo.svg`;
  const keywords    = settings?.seoKeywords || '';

  // Title: explicit prop > admin override > built-in default > nothing (home page)
  const resolvedTitle =
    title ||
    adminPage.title?.trim() ||
    defaults.title ||
    null;

  // Description: explicit prop > admin override > built-in default > global fallback
  const resolvedDesc =
    description ||
    adminPage.description?.trim() ||
    defaults.description ||
    settings?.seoDescription ||
    '';

  const fullTitle = resolvedTitle ? `${resolvedTitle} | ${siteName}` : siteName;
  const canonical = url || `${SITE_URL}${location.pathname}`;
  const ogImage   = image || globalImage;

  return (
    <Helmet>
      {/* Core */}
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={resolvedDesc} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:type"        content={type} />
      <meta property="og:site_name"   content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={resolvedDesc} />
      <meta name="twitter:image"       content={ogImage} />
    </Helmet>
  );
};

export default SEO;
