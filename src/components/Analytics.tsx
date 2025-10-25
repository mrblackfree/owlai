import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { useLocation } from 'react-router-dom';

export const Analytics: React.FC = () => {
  const { config } = useSiteConfig();
  const location = useLocation();
  
  // Track page views when the location changes
  useEffect(() => {
    if (config?.analyticsId && window.gtag) {
      window.gtag('config', config.analyticsId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, config?.analyticsId]);

  // Don't render anything if no analytics ID is provided
  if (!config?.analyticsId) {
    return null;
  }

  return (
    <Helmet>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${config.analyticsId}`}></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${config.analyticsId}');
        `}
      </script>
    </Helmet>
  );
}; 