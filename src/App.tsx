import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/ui/navigation';
import { ProtectedRoute } from '@/components/ui/protected-route';
import { Toaster } from '@/components/ui/sonner';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { Dashboard } from '@/pages/Dashboard';
import { ChallengeListPage } from '@/pages/ChallengeListPage';
import { ChallengeDetailPage } from '@/pages/ChallengeDetailPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ProfilePage } from '@/pages/ProfilePage';
import { LearnPage } from '@/pages/LearnPage';
import OnboardingStepPage from '@/pages/onboarding/[step]';
import { OnboardingCompleteScreen } from '@/components/OnboardingCompleteScreen';
import './App.css';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/learn" element={
        <ProtectedRoute>
          <LearnPage />
        </ProtectedRoute>
      } />
      <Route path="/challenges" element={
        <ProtectedRoute>
          <ChallengeListPage />
        </ProtectedRoute>
      } />
      <Route path="/challenges/:id" element={
        <ProtectedRoute>
          <ChallengeDetailPage />
        </ProtectedRoute>
      } />
      
      {/* Onboarding routes */}
      <Route path="/onboarding/:step" element={
        <ProtectedRoute>
          <OnboardingStepPage />
        </ProtectedRoute>
      } />
      
      <Route path="/onboarding/complete" element={
        <ProtectedRoute>
          <OnboardingCompleteScreen />
        </ProtectedRoute>
      } />
      
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <LeaderboardPage />
        </ProtectedRoute>
      } />
      <Route path="/learn" element={
        <ProtectedRoute>
          <LearnPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/profile/:id" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      {/* Admin only routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <AppRoutes />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;