import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { SkipToContent } from './components/SkipToContent';
import { Footer } from './components/Footer';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { LoadingProvider } from './contexts/LoadingContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CookieProvider } from './contexts/CookieContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { SiteProvider } from './contexts/SiteContext';
import { SEOProvider } from './contexts/SEOContext';
import { SEOManager } from './components/SEOManager';

import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TwoStepPopup } from './components/popups/TwoStepPopup';
import { CookieBanner } from './components/CookieBanner';
import { CookieSettingsModal } from './components/CookieSettingsModal';
import { Toaster } from './components/ui/sonner';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Insights = lazy(() => import('./pages/Insights'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact = lazy(() => import('./pages/Contact'));

const AreaGuide = lazy(() => import('./pages/AreaGuide'));
const AdminPanel = lazy(() => import('./components/cms/AdminPanel').then(module => ({ default: module.AdminPanel })));

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Simple loading fallback for Suspense
const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-2 border-[#1A2551] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Layout component for frontend website
function FrontendLayout() {
  return (
    <>
      <SEOManager />
      <SkipToContent />
      <LoadingScreen />
      <ScrollToTop />
      <Navigation />
      <Outlet />
      <Footer />
      <StickyMobileCTA />
      <TwoStepPopup />
      <CookieBanner />
      <CookieSettingsModal />
    </>
  );
}

import { cleanupSiteImages } from './utils/cleanupSiteImages';

export default function App() {
  useEffect(() => {
    // Temporary cleanup for obsolete site images
    cleanupSiteImages();
  }, []);

  return (
    <BrowserRouter>
      <SEOProvider>
        <SiteProvider>
          <LoadingProvider>
            <FavoritesProvider>
              <CookieProvider>
                <AnalyticsProvider>
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Admin Panel Route */}
                        <Route path="/admin" element={<AdminPanel />} />



                        {/* Frontend Website Routes */}
                        <Route element={<FrontendLayout />}>
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<AboutUs />} />
                          <Route path="/properties" element={<Properties />} />
                          <Route path="/properties/:slug" element={<PropertyDetail />} />
                          <Route path="/insights" element={<Insights />} />
                          <Route path="/blog/:slug" element={<BlogPost />} />
                          <Route path="/contact" element={<Contact />} />

                          <Route path="/:slug" element={<AreaGuide />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/cookie-policy" element={<CookiePolicy />} />
                          {/* Catch-all route for preview_page.html and other unmatched routes */}
                          <Route path="*" element={<NotFound />} />
                        </Route>
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </AnalyticsProvider>
              </CookieProvider>
            </FavoritesProvider>
          </LoadingProvider>
        </SiteProvider>
      </SEOProvider>
      {/* Toaster for notifications */}
      <Toaster />
    </BrowserRouter>
  );
}