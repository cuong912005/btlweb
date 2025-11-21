import React, { useState } from 'react';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { showSuccess, showError } from '../../utils/toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      showSuccess('Tin nhắn của bạn đã được gửi! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'Email',
      content: 'admin@volunteerhub.vn',
      link: 'mailto:admin@volunteerhub.vn',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: PhoneIcon,
      title: 'Điện thoại',
      content: '1900 1234',
      link: 'tel:19001234',
      color: 'from-teal-500 to-green-600'
    },
    {
      icon: MapPinIcon,
      title: 'Địa chỉ',
      content: 'Hà Nội, Việt Nam',
      link: null,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const faqItems = [
    {
      question: 'Làm thế nào để đăng ký tham gia sự kiện?',
      answer: 'Bạn chỉ cần đăng nhập, tìm kiếm sự kiện phù hợp và nhấn nút "Đăng ký tham gia".'
    },
    {
      question: 'Tôi có thể tổ chức sự kiện tình nguyện không?',
      answer: 'Có, bạn có thể tạo sự kiện mới sau khi đăng nhập. Admin sẽ duyệt sự kiện trong 24-48 giờ.'
    },
    {
      question: 'Có tính phí khi sử dụng VolunteerHub không?',
      answer: 'VolunteerHub hoàn toàn miễn phí cho cả tình nguyện viên và tổ chức.'
    },
    {
      question: 'Làm sao để liên hệ hỗ trợ?',
      answer: 'Bạn có thể gửi tin nhắn qua form liên hệ hoặc email trực tiếp cho chúng tôi.'
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
              <ChatBubbleLeftRightIcon className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid md:grid-cols-3 gap-6">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border-2 border-teal-100 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4 shadow-lg`}>
                <info.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
              {info.link ? (
                <a
                  href={info.link}
                  className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                >
                  {info.content}
                </a>
              ) : (
                <p className="text-gray-700 font-semibold">{info.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form & FAQ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-teal-100">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full text-teal-700 font-semibold mb-4">
                <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                Gửi tin nhắn
              </div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Để lại lời nhắn
              </h2>
              <p className="text-gray-600">
                Chúng tôi sẽ phản hồi trong vòng 24 giờ
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📋 Chủ đề
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Chủ đề tin nhắn"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💬 Nội dung
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                  placeholder="Nội dung tin nhắn của bạn..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center ${
                  isSubmitting
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transform hover:scale-[1.02]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                    Gửi tin nhắn
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full text-teal-700 font-semibold mb-4">
                ❓ Câu hỏi thường gặp
              </div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                FAQ
              </h2>
              <p className="text-gray-600">
                Câu trả lời cho những thắc mắc phổ biến
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-100 hover:border-teal-300 transition-all"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {item.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed ml-9">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-teal-100 text-center">
          <MapPinIcon className="w-12 h-12 mx-auto mb-4 text-teal-600" />
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Ghé thăm chúng tôi
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Trụ sở chính: Hà Nội, Việt Nam
          </p>
          <p className="text-gray-500">
            Chúng tôi luôn chào đón bạn đến thăm văn phòng. Vui lòng liên hệ trước để hẹn lịch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;