import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { settingsService } from '../services/api';

const SiteSettingsContext = createContext(null);

/** Upsert a <meta> tag */
const setMeta = (selector, attrName, attrValue, content) => {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/** Map pathname → pageSeo key */
const pathToPageKey = (pathname) => {
  if (pathname === '/' || pathname === '') return 'home';
  const seg = pathname.split('/').filter(Boolean)[0];
  return seg || 'home';
};

/**
 * Apply SEO meta tags.
 * pageSeoOverride: { title, description } from per-page settings (may be empty strings).
 * global: the top-level settings object.
 */
const applyMeta = (global, pageSeoOverride = {}) => {
  const title = pageSeoOverride.title || global.siteTitle || 'Tim Bin | Software Engineer';
  const description = pageSeoOverride.description || global.seoDescription || '';
  const keywords = global.seoKeywords || '';
  const ogImage = global.ogImage || '';

  document.title = title;

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  if (ogImage) {
    setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
  }
};

const DEFAULTS = {
  siteTitle: 'Tim Bin | Software Engineer',
  seoDescription: '',
  seoKeywords: '',
  ogImage: '',
  siteUrl: '',
  pageSeo: {},
  navVisibility: {
    about: true, skills: true, experience: true,
    projects: true, education: true, certificates: true, blog: true, contact: true,
  },
  showFooter: true,
  footerText: '@2026 Tim.',
  allowContactForm: true,
  availableForWork: true,
  heroBadge: 'Available for work',
  ctaHeading: "Let's Build Something Amazing Together",
  ctaSubtext: "I'm currently open to freelance projects and full-time roles. Let's discuss how I can add value to your team.",
  typingRoles: ['Software Engineer', 'React Specialist', 'Node.js Engineer', 'UI/UX Enthusiast', 'Problem Solver'],
  maintenanceMode: false,
  maintenanceMessage: '',
  googleAnalyticsId: '',
};

/** Inner component — needs router context */
const SettingsApplier = ({ settings, children }) => {
  const location = useLocation();

  useEffect(() => {
    const key = pathToPageKey(location.pathname);
    const override = settings.pageSeo?.[key] ?? {};
    applyMeta(settings, override);
  }, [location.pathname, settings]);

  return children;
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService.getPublic()
      .then(res => {
        if (res.data?.data) {
          const data = res.data.data;
          const merged = {
            ...DEFAULTS,
            ...data,
            // Deep-merge navVisibility so new keys (e.g. blog) from DEFAULTS
            // aren't wiped out when the DB record predates them
            navVisibility: { ...DEFAULTS.navVisibility, ...(data.navVisibility || {}) },
          };
          setSettings(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      <SettingsApplier settings={settings}>
        {children}
      </SettingsApplier>
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
