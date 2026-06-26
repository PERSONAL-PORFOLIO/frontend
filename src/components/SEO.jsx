import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://tim-porfolio.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/asktim-logo.svg`;

/**
 * SEO component — drop into any page to set <title>, description, and Open Graph tags.
 * Props:
 *   title       — page title (appended with " | Tim's Portfolio")
 *   description — meta description
 *   image       — og:image URL (defaults to AskTim logo)
 *   url         — canonical URL (defaults to current page)
 *   type        — og:type (defaults to 'website')
 */
const SEO = ({
  title,
  description = "Tim's software engineering portfolio — skills, projects, experience and more.",
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
}) => {
  const fullTitle = title ? `${title} | Tim's Portfolio` : "Tim's Portfolio";
  const canonical = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Tim's Portfolio" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
