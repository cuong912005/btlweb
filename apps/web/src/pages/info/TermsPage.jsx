import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ShieldExclamationIcon,
  ScaleIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TermsPage = () => {
  const sections = [
    {
      icon: UserIcon,
      title: 'Tài khoản người dùng',
      color: 'from-blue-500 to-cyan-600',
      content: [
        {
          subtitle: 'Đăng ký tài khoản',
          points: [
            'Bạn phải từ 16 tuổi trở lên để sử dụng dịch vụ',
            'Thông tin đăng ký phải chính xác và đầy đủ',
            'Mỗi người chỉ được tạo một tài khoản',
            'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập'
          ]
        },
        {
          subtitle: 'Trách nhiệm người dùng',
          points: [
            'Không sử dụng tài khoản cho mục đích bất hợp pháp',
            'Không chia sẻ tài khoản với người khác',
            'Thông báo ngay nếu tài khoản bị xâm nhập',
            'Tuân thủ các quy định và điều khoản của nền tảng'
          ]
        }
      ]
    },
    {
      icon: CalendarIcon,
      title: 'Sử dụng dịch vụ',
      color: 'from-teal-500 to-green-600',
      content: [
        {
          subtitle: 'Quyền của bạn',
          points: [
            'Tìm kiếm và tham gia các sự kiện tình nguyện',
            'Tạo và quản lý sự kiện (sau khi được phê duyệt)',
            'Tương tác với cộng đồng tình nguyện viên',
            'Theo dõi lịch sử hoạt động của bạn'
          ]
        },
        {
          subtitle: 'Cam kết của bạn',
          points: [
            'Tham gia đúng sự kiện đã đăng ký',
            'Thông báo trước nếu không thể tham gia',
            'Tôn trọng tổ chức và tình nguyện viên khác',
            'Cung cấp thông tin chính xác khi đăng ký sự kiện'
          ]
        }
      ]
    },
    {
      icon: DocumentTextIcon,
      title: 'Nội dung và hành vi',
      color: 'from-purple-500 to-pink-600',
      content: [
        {
          subtitle: 'Nội dung được phép',
          points: [
            'Thông tin sự kiện tình nguyện hợp pháp',
            'Chia sẻ kinh nghiệm tích cực',
            'Đánh giá công bằng và trung thực',
            'Nội dung liên quan đến hoạt động cộng đồng'
          ]
        },
        {
          subtitle: 'Nội dung bị cấm',
          points: [
            'Thông tin sai sự thật, gây hiểu lầm',
            'Nội dung bạo lực, phân biệt đối xử',
            'Spam, quảng cáo không liên quan',
            'Vi phạm bản quyền hoặc quyền sở hữu trí tuệ',
            'Lừa đảo hoặc gian lận'
          ]
        }
      ]
    },
    {
      icon: ShieldExclamationIcon,
      title: 'Quyền sở hữu trí tuệ',
      color: 'from-yellow-500 to-orange-600',
      content: [
        {
          subtitle: 'Quyền của VolunteerHub',
          points: [
            'Toàn bộ nội dung, thiết kế, logo thuộc sở hữu của chúng tôi',
            'Bạn không được sao chép, sửa đổi mà không có sự cho phép',
            'Tên "VolunteerHub" là nhãn hiệu đã đăng ký'
          ]
        },
        {
          subtitle: 'Quyền của bạn',
          points: [
            'Bạn giữ quyền sở hữu nội dung bạn đăng tải',
            'Bạn cấp cho chúng tôi quyền sử dụng nội dung để vận hành dịch vụ',
            'Chúng tôi có thể sử dụng nội dung của bạn cho mục đích quảng bá'
          ]
        }
      ]
    },
    {
      icon: NoSymbolIcon,
      title: 'Chấm dứt tài khoản',
      color: 'from-red-500 to-pink-600',
      content: [
        {
          subtitle: 'Bạn có thể',
          points: [
            'Xóa tài khoản bất cứ lúc nào',
            'Dữ liệu sẽ bị xóa vĩnh viễn sau 30 ngày',
            'Một số thông tin có thể được lưu giữ theo yêu cầu pháp luật'
          ]
        },
        {
          subtitle: 'Chúng tôi có thể',
          points: [
            'Tạm ngưng tài khoản nếu vi phạm điều khoản',
            'Chấm dứt tài khoản có hành vi gian lận',
            'Khóa tài khoản nếu nghi ngờ bảo mật',
            'Thông báo trước khi chấm dứt (trừ trường hợp nghiêm trọng)'
          ]
        }
      ]
    },
    {
      icon: ScaleIcon,
      title: 'Trách nhiệm pháp lý',
      color: 'from-indigo-500 to-purple-600',
      content: [
        {
          subtitle: 'Giới hạn trách nhiệm',
          points: [
            'Chúng tôi không chịu trách nhiệm về hành vi của người dùng',
            'Không đảm bảo dịch vụ hoạt động không gián đoạn',
            'Không chịu trách nhiệm về thiệt hại gián tiếp',
            'Trách nhiệm của chúng tôi giới hạn theo luật pháp'
          ]
        },
        {
          subtitle: 'Bồi thường',
          points: [
            'Bạn đồng ý bồi thường cho chúng tôi nếu vi phạm điều khoản',
            'Bồi thường bao gồm chi phí pháp lý và các khoản liên quan',
            'Áp dụng cho cả hành vi cố ý và vô ý vi phạm'
          ]
        }
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
              <DocumentTextIcon className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6">
              Điều khoản sử dụng
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
              Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ của chúng tôi
            </p>
            <p className="text-teal-200 mt-4">
              Có hiệu lực từ: 14 tháng 11, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-teal-100 mb-12">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            Chào mừng đến với VolunteerHub
          </h2>
          <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
            <p>
              Điều khoản sử dụng này ("Điều khoản") quy định việc sử dụng nền tảng VolunteerHub 
              ("Dịch vụ", "Nền tảng") do chúng tôi cung cấp.
            </p>
            <p>
              Bằng cách truy cập hoặc sử dụng Dịch vụ, bạn đồng ý tuân thủ và bị ràng buộc bởi 
              các Điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào của Điều khoản, 
              vui lòng không sử dụng Dịch vụ.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-800">
                  <strong>Lưu ý quan trọng:</strong> Chúng tôi có thể cập nhật Điều khoản này 
                  theo thời gian. Việc tiếp tục sử dụng Dịch vụ sau khi có thay đổi đồng nghĩa 
                  với việc bạn chấp nhận các điều khoản mới.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
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
                    {index + 1}. {section.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                {section.content.map((subsection, subIndex) => (
                  <div key={subIndex}>
                    <h4 className="text-lg font-bold text-gray-800 mb-3 ml-1">
                      {subsection.subtitle}
                    </h4>
                    <ul className="space-y-2">
                      {subsection.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5"
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
                          <span className="text-gray-700 leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Important Sections */}
        <div className="space-y-8 mt-8">
          {/* Dispute Resolution */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <ScaleIcon className="w-8 h-8 text-teal-600 mr-3" />
              Giải quyết tranh chấp
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                Mọi tranh chấp phát sinh từ hoặc liên quan đến việc sử dụng Dịch vụ sẽ được 
                giải quyết theo pháp luật Việt Nam.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Bước 1: Liên hệ trực tiếp với chúng tôi để giải quyết thân thiện</li>
                <li>Bước 2: Hòa giải qua trung tâm hòa giải (nếu cần)</li>
                <li>Bước 3: Khởi kiện tại Tòa án có thẩm quyền tại Việt Nam</li>
              </ul>
            </div>
          </div>

          {/* Governing Law */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ⚖️ Luật áp dụng
            </h3>
            <div className="text-gray-700">
              <p>
                Điều khoản này được điều chỉnh và hiểu theo pháp luật của nước Cộng hòa 
                Xã hội Chủ nghĩa Việt Nam, không xét đến các quy định về xung đột pháp luật.
              </p>
            </div>
          </div>

          {/* Severability */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              📋 Tính khả thi
            </h3>
            <div className="text-gray-700">
              <p>
                Nếu bất kỳ điều khoản nào trong Điều khoản này bị coi là không hợp lệ hoặc 
                không thể thực thi, điều khoản đó sẽ bị loại bỏ hoặc giới hạn ở mức tối thiểu 
                cần thiết, và các điều khoản còn lại sẽ tiếp tục có hiệu lực đầy đủ.
              </p>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🔄 Thay đổi điều khoản
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                Chúng tôi có quyền sửa đổi hoặc thay thế các Điều khoản này bất cứ lúc nào. 
                Nếu có thay đổi trọng yếu, chúng tôi sẽ:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Thông báo qua email ít nhất 30 ngày trước</li>
                <li>Hiển thị thông báo trên nền tảng</li>
                <li>Cập nhật ngày "Có hiệu lực từ" ở đầu trang</li>
              </ul>
              <p className="text-teal-600 font-semibold">
                Việc tiếp tục sử dụng Dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc 
                bạn chấp nhận các Điều khoản mới.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-8 text-center text-white shadow-2xl mt-12">
          <DocumentTextIcon className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold mb-4">
            Câu hỏi về điều khoản?
          </h2>
          <p className="text-xl text-teal-100 mb-6 max-w-2xl mx-auto">
            Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng, vui lòng liên hệ:
          </p>
          <div className="space-y-2 mb-8">
            <p className="text-teal-100">
              📧 Email: admin@volunteerhub.vn
            </p>
            <p className="text-teal-100">
              📞 Hotline: 1900 1234
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Liên hệ chúng tôi
            </Link>
            <Link
              to="/privacy"
              className="inline-flex items-center px-8 py-3 bg-teal-700 text-white rounded-xl font-semibold hover:bg-teal-800 transition-all transform hover:scale-105 shadow-lg"
            >
              Xem chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;