import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Import the SiteConfig type from the settings page
import { SiteConfig } from '@/pages/admin/settings/SiteSettingsPage';

type SiteConfigContextType = {
  config: SiteConfig | null;
  loading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  lastRefreshTime: number;
};

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

const defaultConfig: SiteConfig = {
  siteName: 'AI Tool Finder',
  siteDescription: 'Discover the best AI tools for your needs',
  logo: '/logo.svg',
  logoLight: '/logo-light.svg',
  logoDark: '/logo-dark.svg',
  favicon: '/favicon.ico',
  primaryColor: '#10b981',
  secondaryColor: '#3b82f6',
  allowUserRegistration: true,
  allowUserSubmissions: true,
  requireApprovalForSubmissions: true,
  requireApprovalForReviews: true,
  footerText: '© 2024 AI Tool Finder. All rights reserved.',
  contactEmail: '',
  socialLinks: {
    twitter: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    github: ''
  },
  analyticsId: '',
  customCss: '',
  customJs: '',
  metaTags: {
    title: 'AI Tool Finder - Discover the Best AI Tools',
    description: 'Find the best AI tools for your needs, from content creation to productivity and beyond.',
    keywords: 'AI tools, artificial intelligence, productivity tools, AI software',
    ogImage: '/og-image.jpg'
  },
  defaultTheme: 'system',
  allowThemeToggle: true
};

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  // Use useCallback to memoize the refreshConfig function
  const refreshConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('SiteConfigContext: Refreshing configuration...');
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005';
      
      // First try to use the force-refresh endpoint
      try {
        const refreshResponse = await axios.get(`${apiBaseUrl}/api/config/force-refresh`, {
          // Add cache-busting parameter
          params: { _t: Date.now() },
          // Set a reasonable timeout
          timeout: 5000
        });
        
        if (refreshResponse.data.success) {
          console.log('SiteConfigContext: Config refreshed successfully via force-refresh endpoint');
          setConfig(refreshResponse.data.config);
          setLastRefreshTime(Date.now());
          setLoading(false);
          return;
        }
      } catch (refreshError) {
        console.warn('SiteConfigContext: Could not use force-refresh endpoint, falling back to regular config fetch', refreshError);
      }
      
      // Fallback to regular config endpoint
      const response = await axios.get(`${apiBaseUrl}/api/config`, {
        // Add cache-busting parameter
        params: { _t: Date.now() },
        // Set a reasonable timeout
        timeout: 5000
      });
      
      console.log('SiteConfigContext: Site config loaded successfully:', response.data);
      setConfig(response.data);
      setLastRefreshTime(Date.now());
    } catch (err) {
      console.error('SiteConfigContext: Error loading site config:', err);
      setError('Failed to load site configuration. Using defaults.');
      // Set default config if we don't have one yet
      if (!config) {
        console.log('SiteConfigContext: Using default configuration');
        setConfig(defaultConfig);
      }
    } finally {
      setLoading(false);
    }
  }, [config]);

  // Initial load of config
  useEffect(() => {
    refreshConfig();
  }, []);

  // Add auto-refresh interval (every 1 minute)
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('SiteConfigContext: Auto-refreshing configuration...');
      refreshConfig();
    }, 60 * 1000); // Reduced to 1 minute for better responsiveness

    return () => clearInterval(intervalId);
  }, [refreshConfig]);
  
  // Refresh config when app comes back to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('SiteConfigContext: Page became visible, refreshing config...');
        refreshConfig();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshConfig]);

  const value = {
    config: config || defaultConfig,
    loading,
    error,
    refreshConfig,
    lastRefreshTime
  };

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = (): SiteConfigContextType => {
  const context = useContext(SiteConfigContext);
  
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  
  return context;
}; 