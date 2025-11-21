import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { showSuccess } from '../../../utils/toast';

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
});

const LoginForm = () => {
  const { user, login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const onSubmit = async (data) => {
    try {
      clearError();
      const result = await login(data);
      
      if (result.success) {
        showSuccess('Đăng nhập thành công! Chào mừng bạn trở lại.');
        
        // Get the page user tried to access before login
        const from = location.state?.from || '/';
        
        // Redirect to that page or dashboard
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error is handled by the auth store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Container with Gradient Border */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-teal-100">
          <div>
            {/* Gradient Logo */}
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-xl transform hover:scale-110 transition-transform">
              <svg 
                className="h-8 w-8 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Đăng nhập vào VolunteerHub
            </h2>
            <p className="mt-3 text-center text-sm text-gray-600">
              Hoặc{' '}
              <Link
                to="/register"
                className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                tạo tài khoản mới
              </Link>
            </p>
          </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Global Error Message */}
          {error && (
            <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 p-4 border border-red-200 shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-red-500" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`appearance-none relative block w-full px-4 py-3 border-2 ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all sm:text-sm`}
                  placeholder="Nhập email của bạn"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Mật khẩu
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`appearance-none relative block w-full px-4 py-3 pr-12 border-2 ${
                    errors.password ? 'border-red-300' : 'border-gray-200'
                  } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all sm:text-sm`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-teal-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-teal-500" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white shadow-lg ${
                loading
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transform hover:scale-[1.02] transition-all'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
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
                  Đang đăng nhập...
                </div>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Đăng nhập
                </span>
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              🔑 Quên mật khẩu?
            </Link>
          </div>
        </form>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
};

export default LoginForm;