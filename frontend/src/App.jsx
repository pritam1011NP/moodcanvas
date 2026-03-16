import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NewEntryPage from "./pages/NewEntryPage";
import EntryDetailPage from "./pages/EntryDetailPage";
import InsightsPage from "./pages/InsightsPage";
import CanvasPage from "./pages/CanvasPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-canvas-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 mood-blob bg-violet-500 opacity-80" />
        <p className="text-canvas-muted font-body text-sm">Loading your canvas…</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/journal/new" element={<NewEntryPage />} />
          <Route path="/journal/:id" element={<EntryDetailPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/canvas" element={<CanvasPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
