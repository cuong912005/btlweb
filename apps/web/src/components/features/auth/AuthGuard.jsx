import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <svg 
        className="animate-spin h-12 w-12 text-indigo-600" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="mt-4 text-sm text-gray-600">Đang tải...</p>
    </div>
  </div>
);

// Unauthorized Component
const UnauthorizedMessage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
        <svg 
          className="h-6 w-6 text-red-600" 
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
      <h2 className="mt-6 text-2xl font-bold text-gray-900">
        Không có quyền truy cập
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Bạn không có quyền truy cập vào trang này
      </p>
      <div className="mt-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Quay lại
        </button>
      </div>
    </div>
  </div>
);

/**
 * AuthGuard Component - Protects routes based on authentication and role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if authorized
 * @param {Array<string>} props.allowedRoles - Array of allowed roles ['VOLUNTEER', 'ORGANIZER', 'ADMIN']
 * @param {string} props.redirectTo - Path to redirect if unauthorized (default: '/login')
 */
const AuthGuard = ({ 
  children, 
  allowedRoles = null,
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();
  
  // Compute isAuthenticated locally to ensure reactivity
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        navigate(redirectTo);
        return;
      }
      
      // Check if user has required role
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Don't redirect, just show unauthorized message
        return;
      }
    }
  }, [isAuthenticated, user, loading, allowedRoles, navigate, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // User is not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // User doesn't have required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <UnauthorizedMessage />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default AuthGuard;