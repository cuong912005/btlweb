import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// No longer need EventProvider - using Zustand

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Epic 2 - Event Management Pages
import EventDiscoveryPage from './pages/event/EventDiscoveryPage';
import EventCreationPage from './pages/event/EventCreationPage';
import MyEventsPage from './pages/event/MyEventsPage';

// Components
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/event/EventDetailPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Epic 2 - Event Management Routes */}
          <Route path="events" element={<EventDiscoveryPage />} />
          <Route path="events/create" element={<EventCreationPage />} />
          <Route path="events/my" element={<MyEventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

