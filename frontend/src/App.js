"use client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import PatientDashboard from "./components/Dashboard/PatientDashboard";
import CaretakerDashboard from "./components/Dashboard/CaretakerDashboard";
import AdherenceAnalytics from "./components/Analytics/AdherenceAnalytics";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import socketService from "./services/socket";
import LoadingSpinner from "./components/UI/LoadingSpinner";
import "./App.css";

function App() {
  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AdherenceAnalytics />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on user role
  if (user.role === "caretaker") {
    return <CaretakerDashboard />;
  } else if (user.role === "patient") {
    return <PatientDashboard />;
  }

  // Default fallback
  return <Navigate to="/login" replace />;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default App;
