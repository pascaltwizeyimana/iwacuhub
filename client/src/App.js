// client/src/App.js
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./i18n";

// Pages (ALL IMPORTS AT TOP)
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Upload = lazy(() => import("./pages/Upload"));
const Profile = lazy(() => import("./pages/Profile"));
const Chat = lazy(() => import("./pages/Chat"));
const Reels = lazy(() => import("./pages/Reels"));
const Videos = lazy(() => import("./pages/Videos"));
const Search = lazy(() => import("./pages/Search"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Live = lazy(() => import("./pages/Live"));

// Admin
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminProtectedRoute = lazy(() => import("./components/AdminProtectedRoute"));

// Loading
const LoadingSpinner = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    Loading...
  </div>
);

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route
function ProtectedRoute({ children }) {
  const auth = useAuth();

  if (auth.loading) return <LoadingSpinner />;
  if (!auth.user) return <Navigate to="/login" replace />;

  return children;
}

// App Content
function AppContent() {
  const auth = useAuth();

  if (auth.loading) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />

        {/* Profile */}
        <Route path="/profile/:userId" element={<Profile />} />
        <Route
          path="/profile"
          element={
            auth.user
              ? <Navigate to={`/profile/${auth.user.id}`} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Protected */}
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/live" element={<ProtectedRoute><Live /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
        <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard initialTab="dashboard" /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminDashboard initialTab="users" /></AdminProtectedRoute>} />
        <Route path="/admin/posts" element={<AdminProtectedRoute><AdminDashboard initialTab="posts" /></AdminProtectedRoute>} />
        <Route path="/admin/comments" element={<AdminProtectedRoute><AdminDashboard initialTab="comments" /></AdminProtectedRoute>} />
        <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminDashboard initialTab="analytics" /></AdminProtectedRoute>} />
        <Route path="/admin/logs" element={<AdminProtectedRoute><AdminDashboard initialTab="logs" /></AdminProtectedRoute>} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", padding: 40 }}>
              <h1>404</h1>
              <p>Route not found</p>
              <button onClick={() => (window.location.href = "/")}>
                Go Home
              </button>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}

// App Root
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}