import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import Layout from './components/Layout';

function AuthLoading() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '12px'
    }}>
      <div style={{
        width: '32px', height: '32px', border: '3px solid #f97316',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#f97316', fontSize: '13px', fontFamily: 'sans-serif' }}>Loading...</p>
    </div>
  );
}

// Public only — logged in users get redirected
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/feed'} replace />;
  return children;
}

// Any authenticated user — both roles allowed
function AnyAuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// User only — admins get sent to /admin
function UserOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

// Admin only
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/feed" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Shared layout — any authenticated user */}
          <Route element={<AnyAuthRoute><Layout /></AnyAuthRoute>}>
            {/* Both users and admins can access explore and profiles */}
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Route>

          {/* User only layout */}
          <Route element={<UserOnlyRoute><Layout /></UserOnlyRoute>}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin only layout */}
          <Route element={<AdminRoute><Layout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}