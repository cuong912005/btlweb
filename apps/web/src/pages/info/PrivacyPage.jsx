import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const PrivacyPage = () => {
  const sections = [
    {
      icon: DocumentTextIcon,
      title: 'Thông tin chúng tôi thu thập',
      color: 'from-blue-500 to-cyan-600',
      content: [
        'Thông tin cá nhân: Họ tên, email, số điện thoại, địa chỉ',
        'Thông tin tài khoản: Tên đăng nhập, mật khẩu (được mã hóa)',
        'Thông tin sử dụng: Lịch sử tham gia sự kiện, hoạt động trên nền tảng',
        'Thông tin kỹ thuật: Địa chỉ IP, loại trình duyệt, thiết bị sử dụng'
      ]
    },
    {
      icon: LockClosedIcon,
      title: 'Cách chúng tôi sử dụng thông tin',
      color: 'from-teal-500 to-green-600',
      content: [
        'Cung cấp và cải thiện dịch vụ của chúng tôi',
        'Kết nối bạn với các sự kiện tình nguyện phù hợp',
        'Gửi thông báo về hoạt động, sự kiện mới',
        'Phân tích và cải thiện trải nghiệm người dùng',
        'Đảm bảo an toàn và bảo mật cho nền tảng',
        'Tuân thủ các quy định pháp luật'
      ]
    },
    {
      icon: EyeSlashIcon,
      title: 'Chia sẻ thông tin',
      color: 'from-purple-500 to-pink-600',
      content: [
        'Với các tổ chức: Khi bạn đăng ký tham gia sự kiện của họ',
        'Với tình nguyện viên khác: Thông tin công khai trong hồ sơ của bạn',
        'Với đối tác dịch vụ: Chỉ khi cần thiết để vận hành nền tảng',
        'Theo yêu cầu pháp luật: Khi bắt buộc tuân thủ quy định',
        'Chúng tôi KHÔNG bán thông tin cá nhân của bạn cho bên thứ ba'
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: 'Bảo vệ thông tin của bạn',
      color: 'from-green-500 to-emerald-600',
      content: [
        'Mã hóa dữ liệu: Sử dụng SSL/TLS cho tất cả kết nối',
        'Mã hóa mật khẩu: Mật khẩu được băm bằng thuật toán mạnh',
        'Kiểm soát truy cập: Chỉ nhân viên được ủy quyền mới truy cập dữ liệu',
        'Giám sát bảo mật: Thường xuyên kiểm tra và cập nhật bảo mật',
        'Sao lưu dữ liệu: Định kỳ sao lưu để tránh mất mát'
      ]
    },
    {
      icon: UserGroupIcon,
      title: 'Quyền của bạn',
      color: 'from-yellow-500 to-orange-600',
      content: [
        'Truy cập: Xem thông tin cá nhân chúng tôi lưu trữ',
        'Chỉnh sửa: Cập nhật hoặc sửa đổi thông tin của bạn',
        'Xóa: Yêu cầu xóa tài khoản và dữ liệu cá nhân',
        'Từ chối: Không đồng ý với việc xử lý dữ liệu nhất định',
        'Di chuyển: Yêu cầu chuyển dữ liệu sang nền tảng khác',
        'Khiếu nại: Liên hệ cơ quan quản lý nếu có vi phạm'
      ]
    },
    {
      icon: EnvelopeIcon,
      title: 'Cookie và công nghệ theo dõi',
      color: 'from-red-500 to-pink-600',
      content: [
        'Cookie phiên: Duy trì phiên đăng nhập của bạn',
        'Cookie chức năng: Lưu tùy chọn và cài đặt của bạn',
        'Cookie phân tích: Hiểu cách bạn sử dụng nền tảng',
        'Bạn có thể tắt cookie trong cài đặt trình duyệt',
        'Tắt cookie có thể ảnh hưởng đến một số tính năng'
      ]
    }
  ];

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
              <ShieldCheckIcon className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6">
              Chính sách bảo mật
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn
            </p>
            <p className="text-teal-200 mt-4">
              Cập nhật lần cuối: 14 tháng 11, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-teal-100 mb-12">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            Giới thiệu
          </h2>
          <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
            <p>
              Chào mừng bạn đến với VolunteerHub. Chúng tôi tôn trọng quyền riêng tư của bạn và 
              cam kết bảo vệ thông tin cá nhân mà bạn chia sẻ với chúng tôi.
            </p>
            <p>
              Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ 
              thông tin của bạn khi bạn sử dụng nền tảng VolunteerHub. Bằng cách sử dụng dịch vụ của 
              chúng tôi, bạn đồng ý với các điều khoản được mô tả trong chính sách này.
            </p>
            <p className="text-teal-600 font-semibold">
              💡 Nếu bạn có bất kỳ câu hỏi nào về chính sách này, vui lòng{' '}
              <Link to="/contact" className="underline hover:text-teal-700">
                liên hệ với chúng tôi
              </Link>.
            </p>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-gray-100 hover:border-teal-300 transition-all"
            >
              <div className="flex items-start mb-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mr-4 flex-shrink-0 shadow-lg`}>
                  <section.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                </div>
              </div>

              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-teal-500 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Data Retention */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-gray-100 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🕐 Thời gian lưu trữ dữ liệu
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>
              Chúng tôi chỉ lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để đạt được 
              các mục đích được nêu trong chính sách này.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Dữ liệu tài khoản: Lưu trữ cho đến khi bạn xóa tài khoản</li>
              <li>Lịch sử hoạt động: Lưu trữ tối đa 2 năm</li>
              <li>Log hệ thống: Lưu trữ tối đa 90 ngày</li>
              <li>Dữ liệu sao lưu: Xóa sau 30 ngày từ khi xóa tài khoản</li>
            </ul>
          </div>
        </div>

        {/* Children's Privacy */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-gray-100 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            👶 Quyền riêng tư của trẻ em
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>
              Nền tảng của chúng tôi dành cho người dùng từ 16 tuổi trở lên. Chúng tôi không cố ý 
              thu thập thông tin từ trẻ em dưới 16 tuổi.
            </p>
            <p>
              Nếu bạn là phụ huynh và phát hiện con bạn đã cung cấp thông tin cho chúng tôi, 
              vui lòng liên hệ để chúng tôi xóa thông tin đó.
            </p>
          </div>
        </div>

        {/* International Users */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-gray-100 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🌍 Chuyển dữ liệu quốc tế
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>
              Dữ liệu của bạn được lưu trữ và xử lý tại Việt Nam. Nếu bạn truy cập từ quốc gia khác, 
              dữ liệu của bạn có thể được chuyển đến và duy trì trên máy chủ tại Việt Nam.
            </p>
            <p>
              Chúng tôi đảm bảo rằng các biện pháp bảo vệ thích hợp được áp dụng để bảo vệ 
              thông tin của bạn theo tiêu chuẩn quốc tế.
            </p>
          </div>
        </div>

        {/* Changes to Privacy Policy */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-gray-100 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            📝 Thay đổi chính sách
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>
              Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo 
              cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên trang này và 
              cập nhật "Ngày cập nhật lần cuối".
            </p>
            <p className="text-teal-600 font-semibold">
              Chúng tôi khuyến nghị bạn xem lại chính sách này định kỳ để cập nhật thông tin.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-8 text-center text-white shadow-2xl mt-12">
          <ShieldCheckIcon className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold mb-4">
            Câu hỏi về quyền riêng tư?
          </h2>
          <p className="text-xl text-teal-100 mb-6 max-w-2xl mx-auto">
            Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về chính sách bảo mật của chúng tôi, 
            vui lòng liên hệ:
          </p>
          <div className="space-y-2 mb-8">
            <p className="text-teal-100">
              📧 Email: admin@volunteerhub.vn
            </p>
            <p className="text-teal-100">
              📞 Hotline: 1900 1234
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            Liên hệ chúng tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;