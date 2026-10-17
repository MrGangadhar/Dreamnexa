import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

import Landing       from './pages/Landing';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Contests      from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import QuizPlay      from './pages/QuizPlay';
import Leaderboard   from './pages/Leaderboard';
import Dashboard     from './pages/Dashboard';
import Admin         from './pages/Admin';
import News          from './pages/News';
import CurrentAffairs from './pages/CurrentAffairs';
import GovernmentJobs from './pages/GovernmentJobs';
import Wallet        from './pages/Wallet';
import HelpSupport   from './pages/HelpSupport';
import ContactUs     from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AboutUs       from './pages/AboutUs';
import Disclaimer    from './pages/Disclaimer';
import EditorialPolicy from './pages/EditorialPolicy';
import Settings      from './pages/Settings';
import NotFound      from './pages/NotFound';

// New Sidebar pages
import DailyQuiz     from './pages/DailyQuiz';
import MockTests     from './pages/MockTests';
import Transactions  from './pages/Transactions';
import Notifications from './pages/Notifications';
import Bookmarks     from './pages/Bookmarks';
import Profile       from './pages/Profile';
import Logout        from './pages/Logout';
import Footer        from './components/Footer';

// ── React Query client — 5-min stale time by default ──────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ── Google Analytics Page Tracker ──────────────────────────────────────────
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', 'G-67JP4DTWSX', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AnalyticsTracker />
        <AuthProvider>
          <Navbar />
          <BottomNav />

          <Routes>
            {/* Public routes */}
            <Route path="/"              element={<Landing />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />
            <Route path="/leaderboard"   element={<Leaderboard />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms"          element={<TermsOfService />} />
            <Route path="/terms-and-conditions" element={<TermsOfService />} />
            <Route path="/help-support"  element={<HelpSupport />} />
            <Route path="/contact-us"    element={<ContactUs />} />
            <Route path="/about"          element={<AboutUs />} />
            <Route path="/disclaimer"     element={<Disclaimer />} />
            <Route path="/editorial-policy" element={<EditorialPolicy />} />

            {/* News/Content Module */}
            <Route path="/news"           element={<News key="news" defaultCategory="all" />} />
            <Route path="/news/:id"       element={<News key="news-detail" defaultCategory="all" />} />
            <Route path="/jobs"           element={<GovernmentJobs />} />
            <Route path="/government-jobs" element={<GovernmentJobs />} />
            <Route path="/current-affairs" element={<CurrentAffairs />} />

            {/* Contest routes */}
            <Route path="/contests"       element={<Contests />} />
            <Route path="/contests/:id"   element={<ContestDetail />} />
            <Route path="/contests/:contestId/play" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />

            {/* Protected routes */}
            <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/wallet"        element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/settings"      element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin"         element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

            {/* Protected Sidebar Pages */}
            <Route path="/daily-quiz"    element={<ProtectedRoute><DailyQuiz /></ProtectedRoute>} />
            <Route path="/mock-tests"    element={<ProtectedRoute><MockTests /></ProtectedRoute>} />
            <Route path="/transactions"  element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/bookmarks"     element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
            <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/logout"        element={<Logout />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Site-wide footer with all policy + nav links */}
          <Footer />

          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'var(--font-body)',
              },
              success: { iconTheme: { primary: '#198754', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#C8102E', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
