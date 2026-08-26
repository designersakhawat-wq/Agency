import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { BrandProvider } from './context/BrandContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import BookingModal from './components/home/BookingModal';
import { Loader } from './components/common/Loader';
import CursorSpotlight from './components/common/CursorSpotlight';
import ScrollToTop from './components/common/ScrollToTop';
import UrgencyBanner from './components/common/UrgencyBanner';
import LiveSocialProofToast from './components/common/LiveSocialProofToast';
import InteractiveChatWidget from './components/common/InteractiveChatWidget';
import ExitIntentModal from './components/common/ExitIntentModal';

// Public Pages
import HomePage from './pages/public/HomePage';
import PortfolioPage from './pages/public/PortfolioPage';
import ProjectDetailPage from './pages/public/ProjectDetailPage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import AboutPage from './pages/public/AboutPage';
import BookingPage from './pages/public/BookingPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminProjectEditPage from './pages/admin/AdminProjectEditPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminPackagesPage from './pages/admin/AdminPackagesPage';
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage';
import AdminFaqsPage from './pages/admin/AdminFaqsPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminMediaPage from './pages/admin/AdminMediaPage';
import AdminAssistantPage from './pages/admin/AdminAssistantPage';
import AdminEstimatorPage from './pages/admin/AdminEstimatorPage';
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Protected Admin Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Verifying security credentials..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Layout Wrapper with Interactive Elements
const PublicLayoutWrapper = ({ children, onOpenBooking }) => {
  return (
    <div className="flex flex-col min-h-screen relative selection:bg-teal-500 selection:text-white">
      <CursorSpotlight />
      <Navbar onOpenBooking={onOpenBooking} />
      <main className="flex-1">{children}</main>
      <Footer onOpenBooking={onOpenBooking} />
      <ScrollToTop />
      <LiveSocialProofToast />
      <InteractiveChatWidget onOpenBooking={onOpenBooking} />
      <ExitIntentModal onOpenBooking={onOpenBooking} />
    </div>
  );
};

function App() {
  const [globalBookingOpen, setGlobalBookingOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <CurrencyProvider>
          <BrandProvider>
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
          <Route path="/admin/login" element={<AdminLoginPage />} />

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
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="projects/new" element={<AdminProjectEditPage />} />
            <Route path="projects/edit/:id" element={<AdminProjectEditPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="packages" element={<AdminPackagesPage />} />
            <Route path="inquiries" element={<AdminInquiriesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="testimonials" element={<AdminTestimonialsPage />} />
            <Route path="faqs" element={<AdminFaqsPage />} />
            <Route path="brands" element={<AdminBrandsPage />} />
            <Route path="media" element={<AdminMediaPage />} />
            <Route path="assistant" element={<AdminAssistantPage />} />
            <Route path="estimator" element={<AdminEstimatorPage />} />
            <Route path="invoices" element={<AdminInvoicesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
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
    </AuthProvider>
  );
}

export default App;
