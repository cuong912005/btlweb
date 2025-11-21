import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import NotificationBell from '../features/notifications/NotificationBell';
import ConfirmModal from '../common/ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';

function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const { isOpen, config, confirm, close } = useConfirm();
  
  // Compute isAuthenticated locally to ensure reactivity
  const isAuthenticated = !!user;

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?',
      confirmText: 'Đăng xuất',
      cancelText: 'Hủy',
      type: 'warning'
    });
    
    if (confirmed) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                <svg className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="ml-3 text-xl font-bold text-gray-900">
                  VolunteerHub
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/events"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/events') 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Khám phá sự kiện
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    to="/events/my"
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/events/my') 
                        ? 'bg-teal-50 text-teal-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Sự kiện của tôi
                  </Link>

                  {user?.role === 'VOLUNTEER' && (
                    <Link
                      to="/volunteer/profile"
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive('/volunteer/profile') 
                          ? 'bg-teal-50 text-teal-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Hồ sơ
                    </Link>
                  )}
                  
                  {user?.role === 'ORGANIZER' && (
                    <Link
                      to="/events/create"
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive('/events/create') 
                          ? 'bg-teal-50 text-teal-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Tạo sự kiện
                    </Link>
                  )}
                  
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive('/admin') 
                          ? 'bg-teal-50 text-teal-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  
                  <Link
                    to="/dashboard"
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/dashboard') 
                        ? 'bg-teal-50 text-teal-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <NotificationBell />
                  <span className="hidden lg:inline text-sm text-gray-700">
                    {user?.name}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                    user?.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-700'
                      : user?.role === 'ORGANIZER' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-teal-100 text-teal-700'
                  }`}>
                    {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'ORGANIZER' ? 'Tổ chức' : 'Tình nguyện viên'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-gray-50 border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/') 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/events"
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/events') 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Khám phá sự kiện
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/events/my"
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/events/my') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sự kiện của tôi
                </Link>

                {user?.role === 'VOLUNTEER' && (
                  <Link
                    to="/volunteer/profile"
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/volunteer/profile') 
                        ? 'bg-teal-50 text-teal-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Hồ sơ tình nguyện
                  </Link>
                )}
                
                {user?.role === 'ORGANIZER' && (
                  <Link
                    to="/events/create"
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/events/create') 
                        ? 'bg-teal-50 text-teal-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Tạo sự kiện
                  </Link>
                )}
                
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/admin') 
                        ? 'bg-teal-50 text-teal-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/login') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/register') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="ml-2 text-xl font-bold">VolunteerHub</span>
              </div>
              <p className="text-gray-300 mb-4">
                Kết nối những trái tim tình nguyện, tạo nên những thay đổi tích cực cho cộng đồng.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Liên kết
              </h3>
              <ul className="space-y-2">
                <li><Link to="/events" className="text-gray-300 hover:text-white transition-colors">Sự kiện</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">Về chúng tôi</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Liên hệ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Hỗ trợ
              </h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors">Trung tâm trợ giúp</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Điều khoản sử dụng</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-300">
              &copy; 2025 VolunteerHub. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isOpen}
        onClose={close}
        onConfirm={config.onConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
        isLoading={config.isLoading}
      />
    </div>
  );
}

export default Layout;