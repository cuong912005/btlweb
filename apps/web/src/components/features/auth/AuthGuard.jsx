import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { showError, showWarning } from '../../../utils/toast';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>
      <p className="mt-6 text-lg font-semibold text-gray-700">Đang kiểm tra quyền truy cập...</p>
      <p className="mt-2 text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
    </div>
  </div>
);

// Unauthorized Component
const UnauthorizedMessage = ({ userRole, allowedRoles }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border-2 border-red-100 text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 shadow-xl mb-6">
            <svg 
              className="h-10 w-10 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-700 mb-2 text-lg">
            Bạn không có quyền truy cập vào trang này
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Vai trò của bạn: <span className="font-semibold text-teal-600">{userRole}</span>
            <br />
            Vai trò yêu cầu: <span className="font-semibold text-red-600">{allowedRoles?.join(', ')}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Về trang chủ
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * AuthGuard Component - Protects routes based on authentication and role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if authorized
 * @param {Array<string>} props.allowedRoles - Array of allowed roles ['VOLUNTEER', 'ORGANIZER', 'ADMIN']
 * @param {string} props.redirectTo - Path to redirect if unauthorized (default: '/login')
 * @param {boolean} props.requireAuth - Require authentication (default: true)
 */
const AuthGuard = ({ 
  children, 
  allowedRoles = null,
  redirectTo = '/login',
  requireAuth = true
}) => {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasShownToast, setHasShownToast] = useState(false);
  
  // Compute isAuthenticated locally to ensure reactivity
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!loading && !hasShownToast) {
      // Check if user is authenticated
      if (requireAuth && !isAuthenticated) {
        // Save the location user tried to access
        const from = location.pathname + location.search;
        
        // Show toast notification
        showWarning('Vui lòng đăng nhập để tiếp tục', {
          autoClose: 4000
        });
        
        setHasShownToast(true);
        
        // Redirect to login with return URL
        navigate(redirectTo, { 
          state: { from },
          replace: true 
        });
        return;
      }
      
      // Check if user has required role
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        if (!hasShownToast) {
          showError('Bạn không có quyền truy cập vào trang này');
          setHasShownToast(true);
        }
        return;
      }
    }
  }, [isAuthenticated, user, loading, allowedRoles, navigate, redirectTo, requireAuth, location, hasShownToast]);

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // User is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // User doesn't have required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <UnauthorizedMessage userRole={user.role} allowedRoles={allowedRoles} />;
  }

  // User is authenticated and has required role (or auth not required)
  return <>{children}</>;
};

export default AuthGuard;