import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  UserGroupIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CogIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tất cả', icon: BookOpenIcon, color: 'from-gray-500 to-gray-600' },
    { id: 'account', name: 'Tài khoản', icon: UserGroupIcon, color: 'from-teal-500 to-cyan-600' },
    { id: 'events', name: 'Sự kiện', icon: CalendarIcon, color: 'from-blue-500 to-indigo-600' },
    { id: 'security', name: 'Bảo mật', icon: ShieldCheckIcon, color: 'from-green-500 to-emerald-600' },
    { id: 'settings', name: 'Cài đặt', icon: CogIcon, color: 'from-purple-500 to-pink-600' }
  ];

  const helpTopics = [
    {
      category: 'account',
      title: 'Cách đăng ký tài khoản mới',
      description: 'Hướng dẫn chi tiết cách tạo tài khoản VolunteerHub',
      content: `
        <h3>Bước 1: Truy cập trang đăng ký</h3>
        <p>Nhấn vào nút "Đăng ký" ở góc trên bên phải màn hình.</p>
        
        <h3>Bước 2: Điền thông tin</h3>
        <p>Nhập đầy đủ thông tin: Email, Mật khẩu, Họ tên. Thông tin bổ sung như số điện thoại và địa chỉ không bắt buộc.</p>
        
        <h3>Bước 3: Xác nhận</h3>
        <p>Kiểm tra email để xác nhận tài khoản và bắt đầu sử dụng.</p>
      `
    },
    {
      category: 'account',
      title: 'Quên mật khẩu - Làm thế nào để khôi phục?',
      description: 'Hướng dẫn khôi phục mật khẩu bị quên',
      content: `
        <h3>Khôi phục mật khẩu</h3>
        <p>1. Nhấn vào "Quên mật khẩu?" ở trang đăng nhập</p>
        <p>2. Nhập email đã đăng ký</p>
        <p>3. Kiểm tra email để nhận link đặt lại mật khẩu</p>
        <p>4. Tạo mật khẩu mới theo yêu cầu bảo mật</p>
      `
    },
    {
      category: 'account',
      title: 'Cập nhật thông tin cá nhân',
      description: 'Cách chỉnh sửa hồ sơ và thông tin tài khoản',
      content: `
        <h3>Chỉnh sửa hồ sơ</h3>
        <p>1. Đăng nhập và vào trang "Hồ sơ của tôi"</p>
        <p>2. Nhấn nút "Chỉnh sửa hồ sơ"</p>
        <p>3. Cập nhật thông tin cần thiết</p>
        <p>4. Nhấn "Lưu thay đổi"</p>
      `
    },
    {
      category: 'events',
      title: 'Cách tìm kiếm sự kiện phù hợp',
      description: 'Hướng dẫn tìm kiếm và lọc sự kiện tình nguyện',
      content: `
        <h3>Tìm kiếm sự kiện</h3>
        <p>1. Vào trang "Khám phá sự kiện"</p>
        <p>2. Sử dụng thanh tìm kiếm hoặc bộ lọc theo: địa điểm, thời gian, chủ đề</p>
        <p>3. Xem chi tiết sự kiện và nhấn "Đăng ký tham gia"</p>
        
        <h3>Mẹo tìm kiếm hiệu quả</h3>
        <p>- Sử dụng từ khóa cụ thể</p>
        <p>- Lọc theo khoảng cách gần bạn</p>
        <p>- Xem đánh giá từ người tham gia trước</p>
      `
    },
    {
      category: 'events',
      title: 'Đăng ký tham gia sự kiện',
      description: 'Quy trình đăng ký và tham gia hoạt động tình nguyện',
      content: `
        <h3>Quy trình đăng ký</h3>
        <p>1. Chọn sự kiện bạn muốn tham gia</p>
        <p>2. Đọc kỹ thông tin và yêu cầu</p>
        <p>3. Nhấn "Đăng ký tham gia"</p>
        <p>4. Xác nhận đăng ký</p>
        <p>5. Chờ admin duyệt (nếu cần)</p>
        
        <h3>Lưu ý</h3>
        <p>- Đảm bảo bạn đáp ứng các yêu cầu của sự kiện</p>
        <p>- Kiểm tra thời gian và địa điểm</p>
      `
    },
    {
      category: 'events',
      title: 'Tạo sự kiện tình nguyện mới',
      description: 'Hướng dẫn tổ chức sự kiện của riêng bạn',
      content: `
        <h3>Tạo sự kiện mới</h3>
        <p>1. Vào "Sự kiện của tôi" > "Tạo sự kiện mới"</p>
        <p>2. Điền đầy đủ thông tin sự kiện:</p>
        <p>   - Tiêu đề và mô tả</p>
        <p>   - Thời gian và địa điểm</p>
        <p>   - Số lượng tình nguyện viên cần</p>
        <p>   - Yêu cầu tham gia</p>
        <p>3. Thêm hình ảnh minh họa</p>
        <p>4. Gửi để admin phê duyệt</p>
      `
    },
    {
      category: 'events',
      title: 'Hủy đăng ký sự kiện',
      description: 'Cách hủy đăng ký khi không thể tham gia',
      content: `
        <h3>Hủy đăng ký</h3>
        <p>1. Vào "Sự kiện đã đăng ký"</p>
        <p>2. Chọn sự kiện cần hủy</p>
        <p>3. Nhấn "Hủy đăng ký"</p>
        <p>4. Xác nhận hủy</p>
        
        <h3>Chính sách hủy</h3>
        <p>- Hủy trước 48 giờ: Không ảnh hưởng</p>
        <p>- Hủy trong 48 giờ: Có thể ảnh hưởng đến uy tín</p>
        <p>- Lưu ý: Hãy hủy sớm nếu không thể tham gia</p>
      `
    },
    {
      category: 'security',
      title: 'Bảo mật tài khoản',
      description: 'Các biện pháp bảo vệ tài khoản của bạn',
      content: `
        <h3>Mật khẩu mạnh</h3>
        <p>- Tối thiểu 8 ký tự</p>
        <p>- Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</p>
        <p>- Không sử dụng thông tin cá nhân dễ đoán</p>
        
        <h3>Bảo vệ thông tin</h3>
        <p>- Không chia sẻ mật khẩu</p>
        <p>- Đăng xuất sau khi sử dụng</p>
        <p>- Cẩn thận với email lừa đảo</p>
      `
    },
    {
      category: 'security',
      title: 'Quyền riêng tư và dữ liệu',
      description: 'Cách chúng tôi bảo vệ thông tin của bạn',
      content: `
        <h3>Bảo vệ dữ liệu</h3>
        <p>- Thông tin được mã hóa</p>
        <p>- Không chia sẻ cho bên thứ ba</p>
        <p>- Tuân thủ quy định bảo vệ dữ liệu</p>
        
        <h3>Quyền của bạn</h3>
        <p>- Xem thông tin đã lưu</p>
        <p>- Yêu cầu xóa dữ liệu</p>
        <p>- Xuất dữ liệu cá nhân</p>
      `
    },
    {
      category: 'settings',
      title: 'Cài đặt thông báo',
      description: 'Tùy chỉnh thông báo theo ý muốn',
      content: `
        <h3>Cài đặt thông báo</h3>
        <p>1. Vào "Cài đặt" > "Thông báo"</p>
        <p>2. Chọn loại thông báo muốn nhận:</p>
        <p>   - Email</p>
        <p>   - Push notification</p>
        <p>   - SMS (nếu có)</p>
        <p>3. Lưu cài đặt</p>
      `
    },
    {
      category: 'settings',
      title: 'Xóa tài khoản',
      description: 'Hướng dẫn xóa tài khoản vĩnh viễn',
      content: `
        <h3>Xóa tài khoản</h3>
        <p>⚠️ Lưu ý: Hành động này không thể hoàn tác</p>
        
        <p>1. Vào "Cài đặt" > "Tài khoản"</p>
        <p>2. Cuộn xuống dưới cùng</p>
        <p>3. Nhấn "Xóa tài khoản"</p>
        <p>4. Xác nhận bằng mật khẩu</p>
        <p>5. Tất cả dữ liệu sẽ bị xóa vĩnh viễn</p>
      `
    }
  ];

  const filteredTopics = helpTopics.filter(topic => {
    const matchesCategory = activeCategory === 'all' || topic.category === activeCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [expandedTopic, setExpandedTopic] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600/90 to-cyan-600/90"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-white/20 backdrop-blur-sm">
              <QuestionMarkCircleIcon className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6">
              Trung tâm trợ giúp
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed mb-8">
              Tìm câu trả lời cho mọi thắc mắc của bạn
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm chủ đề trợ giúp..."
                  className="w-full pl-14 pr-4 py-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-teal-100">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  activeCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-5 h-5 mr-2" />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Help Topics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            {filteredTopics.length} chủ đề được tìm thấy
          </h2>
          <p className="text-gray-600">
            Nhấn vào chủ đề để xem hướng dẫn chi tiết
          </p>
        </div>

        <div className="space-y-4">
          {filteredTopics.map((topic, index) => (
            <div
              key={index}
              className="bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-gray-100 hover:border-teal-300 transition-all shadow-lg hover:shadow-xl"
            >
              <button
                onClick={() => setExpandedTopic(expandedTopic === index ? null : index)}
                className="w-full p-6 text-left flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r ${
                      categories.find(c => c.id === topic.category)?.color || 'from-gray-500 to-gray-600'
                    } text-white text-sm font-bold mr-3`}>
                      {index + 1}
                    </span>
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 ml-11">{topic.description}</p>
                </div>
                <svg
                  className={`w-6 h-6 text-teal-600 transition-transform flex-shrink-0 ml-4 ${
                    expandedTopic === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedTopic === index && (
                <div className="px-6 pb-6 ml-11">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                    <div 
                      className="prose prose-teal max-w-none"
                      dangerouslySetInnerHTML={{ __html: topic.content }}
                      style={{
                        fontSize: '15px',
                        lineHeight: '1.7'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-extrabold mb-4">
            Không tìm thấy câu trả lời?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
            Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;