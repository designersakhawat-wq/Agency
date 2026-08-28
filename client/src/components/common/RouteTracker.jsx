import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import tracking from '../../services/trackingService';
import { initUtmCapture } from '../../utils/utmTracker';

/**
 * RouteTracker
 * React Router component that silently captures UTMs on landing and fires Meta Pixel PageView on public route changes.
 */
export const RouteTracker = () => {
  const location = useLocation();

  // Initialize tracking on mount
  useEffect(() => {
    tracking.init();
    initUtmCapture();
  }, []);

  // Track route changes
  useEffect(() => {
    // Only track public-facing routes, ignore admin CMS navigations
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    initUtmCapture();

    // Small timeout ensures document.title has updated
    const timer = setTimeout(() => {
      tracking.trackPageView(document.title, location.pathname);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
};

export default RouteTracker;
