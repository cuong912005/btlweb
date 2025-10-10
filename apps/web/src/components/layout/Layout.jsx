import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">
              VolunteerHub
            </h1>
            <nav className="space-x-4">
              <a href="/" className="text-gray-600 hover:text-primary-600">
                Trang chủ
              </a>
              <a href="/events" className="text-gray-600 hover:text-primary-600">
                Sự kiện
              </a>
              <a href="/login" className="text-gray-600 hover:text-primary-600">
                Đăng nhập
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 VolunteerHub. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;