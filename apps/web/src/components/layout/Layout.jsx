import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  
  // Compute isAuthenticated locally to ensure reactivity
  const isAuthenticated = !!user;

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">VolunteerHub</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium ${
                  isActive('/') 
                    ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/events"
                className={`text-sm font-medium ${
                  isActive('/events') 
                    ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Khám phá sự kiện
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    to="/events/my"
                    className={`text-sm font-medium ${
                      isActive('/events/my') 
                        ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sự kiện của tôi
                  </Link>
                  
                  {user?.role === 'ORGANIZER' && (
                    <Link
                      to="/events/create"
                      className={`text-sm font-medium ${
                        isActive('/events/create') 
                          ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Tạo sự kiện
                    </Link>
                  )}
                  
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium ${
                      isActive('/dashboard') 
                        ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    Xin chào, <span className="font-medium">{user?.name}</span>
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-800'
                      : user?.role === 'ORGANIZER' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'ORGANIZER' ? 'Tổ chức' : 'Tình nguyện viên'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              className={`block px-3 py-2 text-base font-medium ${
                isActive('/') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/events"
              className={`block px-3 py-2 text-base font-medium ${
                isActive('/events') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Khám phá sự kiện
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/events/my"
                  className={`block px-3 py-2 text-base font-medium ${
                    isActive('/events/my') 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sự kiện của tôi
                </Link>
                
                {user?.role === 'ORGANIZER' && (
                  <Link
                    to="/events/create"
                    className={`block px-3 py-2 text-base font-medium ${
                      isActive('/events/create') 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Tạo sự kiện
                  </Link>
                )}
                
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 text-base font-medium ${
                    isActive('/dashboard') 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 text-base font-medium ${
                    isActive('/login') 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className={`block px-3 py-2 text-base font-medium ${
                    isActive('/register') 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-500 hover:text-gray-700'
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
                <li><Link to="/events" className="text-gray-300 hover:text-white">Sự kiện</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white">Về chúng tôi</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white">Liên hệ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Hỗ trợ
              </h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Chính sách bảo mật</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Điều khoản sử dụng</a></li>
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
    </div>
  );
}

export default Layout;