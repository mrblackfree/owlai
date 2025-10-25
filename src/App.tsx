import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";
import { ClerkProvider } from '@clerk/clerk-react';
import { HelmetProvider } from 'react-helmet-async';
import { SponsoredListingsProvider } from './contexts/SponsoredListingsContext';
import { SoftwarePagesProvider } from './contexts/SoftwarePagesContext';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import { MetaTagsManager } from './components/MetaTagsManager';
import { Analytics } from './components/Analytics';
import { initializeVoteCounts } from './utils/voteUtils';
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import AddProduct from "./pages/AddProduct";
import { LatestLaunches } from "./pages/latest-launches";
import { Upcoming } from "./pages/upcoming";
import { TopProducts } from "./pages/top-products";
import Categories from "./pages/categories";
import { LatestNews } from "./pages/latest-news";
import { NewsDetail } from "./pages/news/[slug]";
import { NewsIndex } from "./pages/news";
import { Blog } from "./pages/blog";
import BlogPost from './pages/BlogPost';
import { Discussions } from "./pages/discussions";
import { Events } from "./pages/events";
import { Advertise } from "./pages/advertise";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthModalManager } from "./components/AuthModalManager";
import Dashboard from "./pages/Dashboard";
import { AIToolDetail } from "./pages/AIToolDetail";
import TrendingPage from "./pages/trending";
import AboutPage from './pages/about';
import GuidesPage from "./pages/guides";
import FAQPage from "./pages/faq";
import PrivacyPolicyPage from "./pages/Privacy";
import TermsPage from "./pages/Terms";
import { AdminLayout } from './components/admin/layout/AdminLayout';
import DashboardPage from './pages/admin/dashboard/DashboardPage';
import { AdminProtectedRoute } from './components/admin/auth/AdminProtectedRoute';
import ToolsManagementPage from './pages/admin/tools/ToolsManagementPage';
import UsersManagementPage from './pages/admin/users/UsersManagementPage';
import BlogManagementPage from './pages/admin/blog/BlogManagementPage';
import NewsManagementPage from './pages/admin/news/NewsManagementPage';
import SubmissionsManagementPage from './pages/admin/submissions/SubmissionsManagementPage';
import InquiriesManagementPage from './pages/admin/inquiries/InquiriesManagementPage';
import ReviewManagementPage from './pages/admin/reviews/ReviewManagementPage';
import NewsletterManagementPage from './pages/admin/newsletter/NewsletterManagementPage';
import AdvertisingPlansPage from './pages/admin/advertising/AdvertisingPlansPage';
import SponsoredListingsManagementPage from './pages/admin/sponsorships/SponsoredListingsManagementPage';
import SoftwarePagesManagementPage from './pages/admin/software/SoftwarePagesManagementPage';
import CategoryPage from './pages/category/[id]';
import SoftwarePageDetail from './pages/software/[slug]';
import SiteSettingsPage from './pages/admin/settings/SiteSettingsPage';
import PaymentSettingsPage from './pages/admin/settings/PaymentSettingsPage';
import { AdvertiseSuccess } from "./pages/AdvertiseSuccess";
import { AdvertiseCancel } from "./pages/AdvertiseCancel";

// Import Best Software Pages for backward compatibility
import BestProjectManagementTools from './pages/best-project-management-tools';
import BestAINoteTrackingSoftware from './pages/best-ai-note-taking-software';
import BestAIMeetingTools from './pages/best-ai-meeting-tools';
import BestAIEmailManagementTools from './pages/best-ai-email-management-tools';
import BestProductivityToolsForADHD from './pages/best-productivity-tools-for-adhd';
import BestAIDailyPlanningSoftware from './pages/best-ai-daily-planning-software';
import BestCRMSoftwareForTeams from './pages/best-crm-software-for-teams';

const queryClient = new QueryClient();

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Enhanced ScrollBehaviorFix component
function ScrollBehaviorFix() {
  const location = useLocation();

  useEffect(() => {
    const resetScrollStyles = () => {
      // Reset body styles
      document.body.style.cssText = '';
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      
      // Reset html styles
      document.documentElement.style.cssText = '';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';

      // Remove any overflow hidden classes
      document.body.classList.remove('overflow-hidden', 'fixed');
      document.documentElement.classList.remove('overflow-hidden', 'fixed');

      // Explicitly scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });

      // Force layout recalculation
      window.scrollTo(window.scrollX, window.scrollY);
    };

    // Reset on mount and route change
    resetScrollStyles();

    // Add a small delay to ensure Clerk's components have finished their transitions
    const timeoutId = setTimeout(() => {
      resetScrollStyles();
      // Extra scroll to top for good measure
      window.scrollTo(0, 0);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      resetScrollStyles();
    };
  }, [location.pathname]); // Run effect on route changes

  return null;
}

// Component to handle conditional footer rendering
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollBehaviorFix />
      <MetaTagsManager />
      <Analytics />
      {!isAdminRoute && <Navigation />}
      {!isAdminRoute && <BackgroundAnimation />}
      <Routes>
        {/* Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tools" element={<ToolsManagementPage />} />
            <Route path="sponsorships" element={<SponsoredListingsManagementPage />} />
            {/* Temporarily commented out */}
            {/* <Route path="software" element={<SoftwarePagesManagementPage />} /> */}
            <Route path="blog" element={<BlogManagementPage />} />
            <Route path="news" element={<NewsManagementPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            <Route path="submissions" element={<SubmissionsManagementPage />} />
            <Route path="reviews" element={<ReviewManagementPage />} />
            <Route path="inquiries" element={<InquiriesManagementPage />} />
            <Route path="newsletter" element={<NewsletterManagementPage />} />
            <Route path="advertising-plans" element={<AdvertisingPlansPage />} />
            <Route path="settings" element={<SiteSettingsPage />} />
            <Route path="payment-settings" element={<PaymentSettingsPage />} />
          </Route>
        </Route>

        {/* Software Page Routes - Use the dynamic component for all paths */}
        {/* Temporarily commented out
        <Route path="/best-project-management-tools" element={<SoftwarePageDetail staticSlug="best-project-management-tools" />} />
        <Route path="/best-ai-note-taking-software" element={<SoftwarePageDetail staticSlug="best-ai-note-taking-software" />} />
        <Route path="/best-ai-daily-planning-software" element={<SoftwarePageDetail staticSlug="best-ai-daily-planning-software" />} />
        <Route path="/best-ai-meeting-tools" element={<SoftwarePageDetail staticSlug="best-ai-meeting-tools" />} />
        <Route path="/best-crm-software-for-teams" element={<SoftwarePageDetail staticSlug="best-crm-software-for-teams" />} />
        <Route path="/best-ai-email-management-tools" element={<SoftwarePageDetail staticSlug="best-ai-email-management-tools" />} />
        <Route path="/best-productivity-tools-for-adhd" element={<SoftwarePageDetail staticSlug="best-productivity-tools-for-adhd" />} />
        */}

        {/* Additional dynamic route for future software pages */}
        {/* <Route path="/software/:slug" element={<SoftwarePageDetail />} /> */}

        {/* Existing Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/guides" element={<GuidesPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/latest-launches" element={<LatestLaunches />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/top-products" element={<TopProducts />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/latest-news" element={<LatestNews />} />
        <Route path="/latest-news/:slug" element={<NewsDetail />} />
        <Route path="/news" element={<NewsIndex />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/events" element={<Events />} />
        <Route path="/advertise" element={<Advertise />} />
        <Route path="/advertise/success" element={<AdvertiseSuccess />} />
        <Route path="/advertise/cancel" element={<AdvertiseCancel />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/ai-tools/:slug" element={<AIToolDetail />} />
        <Route path="/ai-tools" element={<Navigate to="/" replace />} />
        <Route path="/aitools" element={<Navigate to="/" replace />} />
        
        {/* Auth routes - redirect to home but with auth modals opened via context */}
        <Route path="/sign-in" element={<AuthRedirect mode="login" />} />
        <Route path="/sign-up" element={<AuthRedirect mode="signup" />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      <AuthModalManager />
    </div>
  );
}

function AuthRedirect({ mode }: { mode: 'login' | 'signup' }) {
  const { openModal } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Open the auth modal
    openModal(mode);
    // Navigate to home page
    navigate('/', { replace: true });
  }, [mode, openModal, navigate]);
  
  return null;
}

function App() {
  // Initialize vote counts (now a placeholder) when the app starts
  useEffect(() => {
    console.log('App useEffect: Initializing app-level configurations.');
    initializeVoteCounts(); // This function now does nothing regarding localStorage votes

    // The previous loop for syncing localStorage with getToolVoteState is removed.
    // All vote and upvote states will be derived from DB via API calls and Clerk metadata.
  }, []);

  return (
    <HelmetProvider>
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      >
        <SiteConfigProvider>
          <AuthProvider>
            <SponsoredListingsProvider>
              <SoftwarePagesProvider>
                <QueryClientProvider client={queryClient}>
                  <TooltipProvider>
                    <BrowserRouter>
                      <AppContent />
                      <Toaster />
                      <Sonner position="top-right" />
                      <AuthModalManager />
                    </BrowserRouter>
                  </TooltipProvider>
                </QueryClientProvider>
              </SoftwarePagesProvider>
            </SponsoredListingsProvider>
          </AuthProvider>
        </SiteConfigProvider>
      </ClerkProvider>
    </HelmetProvider>
  );
}

export default App;