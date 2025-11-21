import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  UserGroupIcon, 
  SparklesIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';

const AboutPage = () => {
  const values = [
    {
      icon: HeartIcon,
      title: 'Tận tâm',
      description: 'Chúng tôi cam kết tạo ra giá trị thực sự cho cộng đồng và những người tình nguyện.',
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Kết nối',
      description: 'Xây dựng cầu nối giữa người có nhu cầu và những trái tim nhiệt huyết.',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      icon: SparklesIcon,
      title: 'Minh bạch',
      description: 'Thông tin rõ ràng, quy trình công khai, tạo niềm tin cho mọi người.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Đổi mới',
      description: 'Ứng dụng công nghệ hiện đại để tối ưu trải nghiệm tình nguyện.',
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  const milestones = [
    { year: '2025', title: 'Ra mắt', description: 'VolunteerHub chính thức ra mắt với sứ mệnh kết nối cộng đồng' },
    { year: '2025+', title: 'Phát triển', description: 'Mở rộng quy mô, hơn 10,000+ tình nguyện viên tham gia' },
    { year: 'Tương lai', title: 'Mục tiêu', description: 'Trở thành nền tảng tình nguyện hàng đầu Việt Nam' }
  ];

  const team = [
    { 
      name: 'Development Team',
      role: 'Đội ngũ phát triển',
      description: 'Những kỹ sư tài năng xây dựng nền tảng công nghệ vững chắc',
      icon: '💻'
    },
    { 
      name: 'Community Team',
      role: 'Đội ngũ cộng đồng',
      description: 'Kết nối và hỗ trợ các tổ chức, tình nguyện viên trên toàn quốc',
      icon: '🤝'
    },
    { 
      name: 'Operations Team',
      role: 'Đội ngũ vận hành',
      description: 'Đảm bảo mọi hoạt động diễn ra suôn sẻ và hiệu quả',
      icon: '⚙️'
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
              <HeartIcon className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6">
              Về chúng tôi
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
              VolunteerHub - Nền tảng kết nối những trái tim tình nguyện, 
              tạo nên những thay đổi tích cực cho cộng đồng
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border-2 border-teal-100">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full text-teal-700 font-semibold mb-4">
                <LightBulbIcon className="w-5 h-5 mr-2" />
                Sứ mệnh của chúng tôi
              </div>
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                Kết nối những trái tim tình nguyện
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Chúng tôi tin rằng mỗi người đều có thể tạo ra sự thay đổi tích cực cho cộng đồng. 
                VolunteerHub ra đời với mục tiêu kết nối những tổ chức, cá nhân có nhu cầu với 
                những người sẵn sàng cống hiến thời gian và công sức của mình.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Thông qua công nghệ hiện đại, chúng tôi mong muốn làm cho hoạt động tình nguyện 
                trở nên dễ dàng, minh bạch và có ý nghĩa hơn bao giờ hết.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 p-1">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🌟</div>
                    <div className="text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                      10,000+
                    </div>
                    <p className="text-gray-600 font-semibold">Tình nguyện viên</p>
                    <div className="mt-8 text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                      500+
                    </div>
                    <p className="text-gray-600 font-semibold">Sự kiện đã tổ chức</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Giá trị cốt lõi
          </h2>
          <p className="text-gray-600 text-lg">
            Những giá trị định hướng mọi hành động của chúng tôi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-100 hover:border-teal-300 hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 shadow-lg`}>
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Hành trình phát triển
          </h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-teal-500 to-cyan-600 hidden md:block"></div>

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8`}>
                <div className="flex-1">
                  <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-teal-100 shadow-lg ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full font-bold text-lg mb-3">
                      {milestone.year}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                
                <div className="hidden md:flex w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 items-center justify-center text-white font-bold shadow-lg z-10">
                  {index + 1}
                </div>
                
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Đội ngũ của chúng tôi
          </h2>
          <p className="text-gray-600 text-lg">
            Những con người tận tâm đằng sau VolunteerHub
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border-2 border-teal-100 hover:border-teal-300 hover:shadow-xl transition-all text-center"
            >
              <div className="text-6xl mb-4">{member.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-teal-600 font-semibold mb-3">{member.role}</p>
              <p className="text-gray-600 leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <HandThumbUpIcon className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-extrabold mb-4">
            Cùng tạo nên sự khác biệt
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn tình nguyện viên khác để tạo ra những thay đổi tích cực cho cộng đồng
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Đăng ký ngay
            </Link>
            <Link
              to="/events"
              className="px-8 py-3 bg-teal-700 text-white rounded-xl font-semibold hover:bg-teal-800 transition-all transform hover:scale-105 shadow-lg"
            >
              Khám phá sự kiện
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;