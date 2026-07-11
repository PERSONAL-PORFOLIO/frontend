import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/api';

// Meta tags are managed entirely by SEO.jsx (react-helmet-async).
// This context only stores settings data — no DOM manipulation.

const SiteSettingsContext = createContext(null);

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

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    settingsService.getPublic()
      .then(res => {
        if (res.data?.data) {
          const data = res.data.data;
          const merged = {
            ...DEFAULTS,
            ...data,
            // Deep-merge navVisibility so keys added in DEFAULTS
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
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
