import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider, theme as antTheme, App as AntdApp } from 'antd';
import App from '@/App';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import '@/styles/global.css';

/** Reads the portfolio theme and configures Ant Design to match */
const ThemedConfigProvider = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          colorBgBase: isDark ? '#0f0f1a' : '#f5f7ff',
          colorBgContainer: isDark ? '#1a1a2e' : '#ffffff',
          colorBgElevated: isDark ? '#1e1e35' : '#ffffff',
          colorText: isDark ? '#e2e8f0' : '#334155',
          colorTextSecondary: isDark ? '#8892a4' : '#64748b',
          borderRadius: 10,
          fontFamily: '\'Inter\', -apple-system, BlinkMacSystemFont, sans-serif',
        },
      }}
    >
      <AntdApp>
        <SiteSettingsProvider>
          {children}
        </SiteSettingsProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
          <ThemedConfigProvider>
            <App />
          </ThemedConfigProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
