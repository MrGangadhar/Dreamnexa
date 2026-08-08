import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Contests    from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import QuizPlay    from './pages/QuizPlay';
import Leaderboard from './pages/Leaderboard';
import Dashboard   from './pages/Dashboard';
import Admin       from './pages/Admin';
import News        from './pages/News';
import Wallet      from './pages/Wallet';

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Navbar />
          <BottomNav />

          <Routes>
            <Route path="/"           element={<Landing />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/contests"   element={<Contests />} />
            <Route path="/contests/:id" element={<ContestDetail />} />
            <Route path="/contests/:contestId/play" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/wallet"     element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/admin"      element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

            {/* ── Latest News Module ─────────────────────────────────── */}
            <Route path="/news"       element={<News key="news" defaultCategory="all" />} />
            <Route path="/jobs"       element={<News key="jobs" defaultCategory="jobs" />} />
            <Route path="/current-affairs" element={<News key="ca" defaultCategory="all" />} />

            {/* 404 */}
            <Route path="*" element={
              <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
                <h2>404 — Page not found.</h2>
              </div>
            } />
          </Routes>

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
