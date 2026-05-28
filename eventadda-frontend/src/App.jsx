import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import ParticipantDashboard from './pages/ParticipantDashboard';
import Wishlist from './pages/Wishlist';

// Role-based Private Route Guard
const SecuredRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-24 text-center text-slate-500">Authenticating session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
        {/* Transparent Navigation Header */}
        <Navbar />

        {/* Core Layout Main Wrapper */}
        <main className="flex-1 pb-16">
          <Routes>
            {/* Public Pathways */}
            <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Secured Organizer Pathways */}
            <Route 
              path="/organizer/dashboard" 
              element={
                <SecuredRoute allowedRole="ORGANIZER">
                  <OrganizerDashboard />
                </SecuredRoute>
              } 
            />
            <Route 
              path="/organizer/create-event" 
              element={
                <SecuredRoute allowedRole="ORGANIZER">
                  <CreateEvent />
                </SecuredRoute>
              } 
            />

            {/* Secured Participant Pathways */}
            <Route 
              path="/participant/dashboard" 
              element={
                <SecuredRoute allowedRole="PARTICIPANT">
                  <ParticipantDashboard />
                </SecuredRoute>
              } 
            />
            <Route 
              path="/participant/wishlist" 
              element={
                <SecuredRoute allowedRole="PARTICIPANT">
                  <Wishlist />
                </SecuredRoute>
              } 
            />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Premium footer */}
        <footer className="w-full py-6 border-t border-slate-900 text-center text-xs text-slate-600 bg-slate-950 select-none">
          <p>© {new Date().getFullYear()} Event Adda. Handcrafted for elite event management and experiences.</p>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
