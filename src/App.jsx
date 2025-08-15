import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ApplicantDashboard from './pages/ApplicantDashboard';
import Navbar from './components/layout/Navbar';
import InterviewScheduler from './pages/InterviewScheduler';
import AllJobs from './pages/AllJobs';
import NotFound from './pages/NotFound';

// A component to protect routes for authenticated users
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user.user_type !== role) {
    // If a role is required and the user doesn't have it, redirect
    return <Navigate to="/" replace />;
  }

  return children;
};

// A component to handle routes for non-authenticated users (e.g., login page)
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// A component to handle the initial redirect after login
const HomeRedirect = () => {
    const { user } = useAuth();    
    if (!user) return <Navigate to="/login" replace />;
    
    return user.user_type === 'recruiter'
        ? <Navigate to="/recruiter/dashboard" replace />
        : <Navigate to="/applicant/dashboard" replace />;
};

function App() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <Navbar />
      <main className="p-4 md:p-8">
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/interview/schedule/:token" element={<InterviewScheduler />} />

          {/* Protected Routes */}
          <Route path="/recruiter/dashboard" element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/applicant/dashboard" element={<ProtectedRoute role="applicant"><ApplicantDashboard /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><AllJobs /></ProtectedRoute>} />
          
          {/* Home/Redirect logic */}
          <Route path="/" element={<HomeRedirect />} />
          
          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;