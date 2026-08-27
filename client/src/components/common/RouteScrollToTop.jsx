import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Universal Route Scroll-To-Top Engine
 * Ensures that whenever a user navigates between any page or route,
 * the window instantly resets to the absolute top (0, 0) without retaining previous scroll offsets.
 */
export const RouteScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If there is an explicit hash (like #pricing-packages), let browser handle or scroll to it
    if (hash) {
      setTimeout(() => {
        const elem = document.querySelector(hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }, 50);
    } else {
      // Instant reset to top on route change
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.body) {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }
  }, [pathname, search, hash]);

  return null;
};

export default RouteScrollToTop;
