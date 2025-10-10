function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chào mừng đến với VolunteerHub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Nền tảng kết nối tình nguyện viên và tổ chức sự kiện tại Việt Nam
        </p>
        <div className="space-x-4">
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
            Tìm hoạt động tình nguyện
          </button>
          <button className="border border-primary-600 text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50">
            Tạo sự kiện mới
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;