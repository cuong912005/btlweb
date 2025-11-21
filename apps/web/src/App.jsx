import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from './stores/authStore';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Epic 2 - Event Management Pages
import EventDiscoveryPage from './pages/event/EventDiscoveryPage';
import EventCreationPage from './pages/event/EventCreationPage';
import MyEventsPage from './pages/event/MyEventsPage';
import EventChannelPage from './pages/event/EventChannelPage';
import EventParticipantsPage from './pages/event/EventParticipantsPage';

// Epic 3 - Volunteer Engagement Pages
import VolunteerProfilePage from './pages/volunteer/VolunteerProfilePage';
import VolunteerHistoryPage from './pages/volunteer/VolunteerHistoryPage';

// Epic 4 - Notifications
import NotificationsPage from './pages/notifications/NotificationsPage';

// Epic 5 - Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';

// Info Pages
import AboutPage from './pages/info/AboutPage';
import ContactPage from './pages/info/ContactPage';
import HelpCenterPage from './pages/info/HelpCenterPage';
import PrivacyPage from './pages/info/PrivacyPage';
import TermsPage from './pages/info/TermsPage';

// Components
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/event/EventDetailPage';
import ScrollToTop from './components/common/ScrollToTop';
import AuthGuard from './components/features/auth/AuthGuard';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize authentication on app mount
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      console.log('Starting auth initialization...');
      
      try {
        const authStore = useAuthStore.getState();
        const user = await authStore.checkAuth();
        
        if (user && mounted) {
          authStore.startTokenRefresh();
          console.log('Auth check completed, user:', user.email);
        } else {
          console.log('No authenticated user found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('Auth timeout - continuing');
        setIsInitializing(false);
      }
    }, 5000);
    
    initialize();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      const authStore = useAuthStore.getState();
      authStore.stopTokenRefresh();
    };
  }, []);

  // Show loading spinner while checking auth
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Epic 2 - Event Management Routes */}
          <Route path="events" element={<EventDiscoveryPage />} />
          <Route path="events/create" element={
            <AuthGuard allowedRoles={['ORGANIZER', 'ADMIN']}>
              <EventCreationPage />
            </AuthGuard>
          } />
          <Route path="events/my" element={
            <AuthGuard>
              <MyEventsPage />
            </AuthGuard>
          } />
          <Route path="events/my-registrations" element={<Navigate to="/events/my" replace />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="events/:eventId/channel" element={
            <AuthGuard>
              <EventChannelPage />
            </AuthGuard>
          } />
          <Route path="events/:eventId/participants" element={
            <AuthGuard allowedRoles={['ORGANIZER', 'ADMIN']}>
              <EventParticipantsPage />
            </AuthGuard>
          } />
          
          {/* Epic 3 - Volunteer Engagement Routes */}
          <Route path="volunteer/profile" element={
            <AuthGuard allowedRoles={['VOLUNTEER']}>
              <VolunteerProfilePage />
            </AuthGuard>
          } />
          <Route path="volunteer/history" element={
            <AuthGuard allowedRoles={['VOLUNTEER']}>
              <VolunteerHistoryPage />
            </AuthGuard>
          } />
          
          {/* Epic 4 - Notifications */}
          <Route path="notifications" element={
            <AuthGuard>
              <NotificationsPage />
            </AuthGuard>
          } />
          
          {/* Epic 5 - Admin */}
          <Route path="admin" element={
            <AuthGuard allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </AuthGuard>
          } />
          <Route path="admin/users" element={
            <AuthGuard allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </AuthGuard>
          } />
          
          <Route path="dashboard" element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          } />
          
          {/* Info Pages */}
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="help" element={<HelpCenterPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

