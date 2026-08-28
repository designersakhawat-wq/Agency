import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { BrandProvider } from './context/BrandContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import BookingModal from './components/home/BookingModal';
import { Loader } from './components/common/Loader';
import CursorSpotlight from './components/common/CursorSpotlight';
import ScrollToTop from './components/common/ScrollToTop';
import RouteScrollToTop from './components/common/RouteScrollToTop';
import LiveSocialProofToast from './components/common/LiveSocialProofToast';
import InteractiveChatWidget from './components/common/InteractiveChatWidget';
import ExitIntentModal from './components/common/ExitIntentModal';
import RouteTracker from './components/common/RouteTracker';
import ModernBackgroundElements from './components/common/ModernBackgroundElements';

// Function to dynamically import with auto-reload on version mismatch
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return;
      }
      throw error;
    }
  });

// Public Pages (HomePage loaded directly for zero-delay above-the-fold render, secondary pages lazy-loaded)
import HomePage from './pages/public/HomePage';
const PortfolioPage = lazyWithRetry(() => import('./pages/public/PortfolioPage'));
const ProjectDetailPage = lazyWithRetry(() => import('./pages/public/ProjectDetailPage'));
const ServicesPage = lazyWithRetry(() => import('./pages/public/ServicesPage'));
const ServiceDetailPage = lazyWithRetry(() => import('./pages/public/ServiceDetailPage'));
const AboutPage = lazyWithRetry(() => import('./pages/public/AboutPage'));
const BookingPage = lazyWithRetry(() => import('./pages/public/BookingPage'));
const ContactPage = lazyWithRetry(() => import('./pages/public/ContactPage'));
const NotFoundPage = lazyWithRetry(() => import('./pages/public/NotFoundPage'));

// Lazy-Loaded Admin Pages (Loaded only when navigating to /admin/*)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminSiteIdentityPage = lazy(() => import('./pages/admin/AdminSiteIdentityPage'));
const AdminHomepageCmsPage = lazy(() => import('./pages/admin/AdminHomepageCmsPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminProjectEditPage = lazy(() => import('./pages/admin/AdminProjectEditPage'));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage'));
const AdminPackagesPage = lazy(() => import('./pages/admin/AdminPackagesPage'));
const AdminInquiriesPage = lazy(() => import('./pages/admin/AdminInquiriesPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminTestimonialsPage = lazy(() => import('./pages/admin/AdminTestimonialsPage'));
const AdminFaqsPage = lazy(() => import('./pages/admin/AdminFaqsPage'));
const AdminBrandsPage = lazy(() => import('./pages/admin/AdminBrandsPage'));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'));
const AdminAssistantPage = lazy(() => import('./pages/admin/AdminAssistantPage'));
const AdminEstimatorPage = lazy(() => import('./pages/admin/AdminEstimatorPage'));
const AdminInvoicesPage = lazy(() => import('./pages/admin/AdminInvoicesPage'));
const AdminAboutCmsPage = lazy(() => import('./pages/admin/AdminAboutCmsPage'));
const AdminTrackingPage = lazy(() => import('./pages/admin/AdminTrackingPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

// Protected Admin Route Guard - 100% Non-Blocking
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem('sakhawat_admin_token'));

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Lazy Fallback
const PublicPageFallback = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
    <span className="text-xs text-zinc-500 font-mono">Loading content...</span>
  </div>
);

// Public Layout Wrapper with Interactive Elements
const PublicLayoutWrapper = ({ children, onOpenBooking }) => {
  return (
    <div className="flex flex-col min-h-screen relative selection:bg-teal-500 selection:text-white">
      <ModernBackgroundElements />
      <CursorSpotlight />
      <Navbar onOpenBooking={onOpenBooking} />
      <main className="flex-1">
        <Suspense fallback={<PublicPageFallback />}>{children}</Suspense>
      </main>
      <Footer onOpenBooking={onOpenBooking} />
      <ScrollToTop />
      <LiveSocialProofToast />
      <InteractiveChatWidget onOpenBooking={onOpenBooking} />
      <ExitIntentModal onOpenBooking={onOpenBooking} />
    </div>
  );
};

// Admin Lazy Fallback Spinner
const AdminFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
  </div>
);

function App() {
  const [globalBookingOpen, setGlobalBookingOpen] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <CurrencyProvider>
            <BrandProvider>
              <RouteScrollToTop />
              <RouteTracker />
              <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <HomePage />
                  </PublicLayoutWrapper>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <PortfolioPage />
                  </PublicLayoutWrapper>
                }
              />
              <Route
                path="/portfolio/:slug"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <ProjectDetailPage />
                  </PublicLayoutWrapper>
                }
              />
              <Route
                path="/services"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <ServicesPage />
                  </PublicLayoutWrapper>
                }
              />
              <Route
                path="/services/:slug"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <ServiceDetailPage />
                  </PublicLayoutWrapper>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <AboutPage />
                  </PublicLayoutWrapper>
                }
              />
              <Route
                path="/book-a-meeting"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <BookingPage />
                  </PublicLayoutWrapper>
                }
              />
              <Route
                path="/booking"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <BookingPage />
                  </PublicLayoutWrapper>
                }
              />
              <Route
                path="/contact"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <ContactPage />
                  </PublicLayoutWrapper>
                }
              />

              {/* Admin Login */}
              <Route
                path="/admin/login"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminLoginPage />
                  </Suspense>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route
                  path="dashboard"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminDashboardPage />
                    </Suspense>
                  }
                />
                <Route
                  path="site-identity"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminSiteIdentityPage />
                    </Suspense>
                  }
                />
                <Route
                  path="homepage"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminHomepageCmsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="about"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminAboutCmsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="projects"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminProjectsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="projects/new"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminProjectEditPage />
                    </Suspense>
                  }
                />
                <Route
                  path="projects/edit/:id"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminProjectEditPage />
                    </Suspense>
                  }
                />
                <Route
                  path="services"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminServicesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="packages"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminPackagesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="inquiries"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminInquiriesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="bookings"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminBookingsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="testimonials"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminTestimonialsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="faqs"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminFaqsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="brands"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminBrandsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="media"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminMediaPage />
                    </Suspense>
                  }
                />
                <Route
                  path="assistant"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminAssistantPage />
                    </Suspense>
                  }
                />
                <Route
                  path="estimator"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminEstimatorPage />
                    </Suspense>
                  }
                />
                <Route
                  path="invoices"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminInvoicesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="tracking"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminTrackingPage />
                    </Suspense>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminSettingsPage />
                    </Suspense>
                  }
                />
              </Route>

              {/* 404 Catch-All */}
              <Route
                path="*"
                element={
                  <PublicLayoutWrapper onOpenBooking={() => setGlobalBookingOpen(true)}>
                    <NotFoundPage />
                  </PublicLayoutWrapper>
                }
              />
            </Routes>

            {/* Global Floating Booking Modal */}
            <BookingModal
              isOpen={globalBookingOpen}
              onClose={() => setGlobalBookingOpen(false)}
            />
          </BrandProvider>
        </CurrencyProvider>
      </ToastProvider>
    </ThemeProvider>
  </AuthProvider>
);
}

export default App;
