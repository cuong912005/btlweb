import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
  HeartIcon,
  ChartBarIcon,
  BoltIcon,
  StarIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon, 
  StarIcon as StarSolidIcon 
} from '@heroicons/react/24/solid';

// Custom hook for scroll animation
const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};

const HomePage = () => {
  const { user } = useAuthStore();

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const HeroSection = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-cyan-800 to-teal-900 min-h-screen flex items-center">
      {/* Animated background with parallax effect */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80&auto=format&fit=crop" 
          alt="Volunteer background" 
          className="w-full h-full object-cover opacity-30 animate-[zoom_20s_ease-in-out_infinite_alternate]"
        />
        
        {/* Floating particles effect - more vibrant */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_0.5s]"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-teal-400/15 to-emerald-500/15 rounded-full blur-3xl animate-[float_7s_ease-in-out_infinite_1s]"></div>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djRoNHYtNGgtNHptMCAwdi00aDR2NGgtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          <div className="sm:text-center lg:text-left lg:col-span-6 space-y-8">
            {/* Badge above title */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 backdrop-blur-md border-2 border-amber-300/40 shadow-lg animate-[fadeInUp_1s_ease-out]">
              <StarSolidIcon className="h-5 w-5 text-amber-300 animate-pulse" />
              <span className="text-amber-200 text-sm font-bold uppercase tracking-wider">Nền tảng tình nguyện #1 Việt Nam</span>
              <StarSolidIcon className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            
            <h1 className="text-5xl tracking-tight font-black text-white sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-2xl animate-[fadeInUp_1s_ease-out] leading-tight">
              <span className="block mb-3">Kết nối</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">tình nguyện viên</span>
            </h1>
            
            <p className="text-xl text-cyan-50 sm:text-2xl max-w-xl sm:mx-auto lg:mx-0 drop-shadow-lg font-medium animate-[fadeInUp_1s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards] leading-relaxed">
              Nền tảng kết nối tình nguyện viên và tổ chức sự kiện tại Việt Nam. 
              Tham gia ngay để tạo ra những thay đổi tích cực cho cộng đồng. 💚
            </p>
            
            <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4 animate-[fadeInUp_1s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards]">
              <Link
                to="/events"
                className="group relative overflow-hidden flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-teal-900 bg-white shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)]"
              >
                <MagnifyingGlassIcon className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                <span>Tìm hoạt động tình nguyện</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              
              <div className="group">
                {user?.role === 'ORGANIZER' ? (
                  <Link
                    to="/events/create"
                    className="relative overflow-hidden flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(251,191,36,0.4)] border-2 border-amber-300/50"
                  >
                    <SparklesIcon className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                    <span>Tạo sự kiện mới</span>
                  </Link>
                ) : !user ? (
                  <Link
                    to="/register"
                    className="relative overflow-hidden flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(251,191,36,0.4)] border-2 border-amber-300/50"
                  >
                    <RocketLaunchIcon className="h-6 w-6 mr-3 group-hover:-translate-y-1 transition-transform" />
                    <span>Tham gia ngay</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="relative overflow-hidden flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(251,191,36,0.4)] border-2 border-amber-300/50"
                  >
                    <ChartBarIcon className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                    <span>Xem dashboard</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side image with parallax */}
          <div className="mt-16 lg:mt-0 lg:col-span-6">
            <div className="relative group">
              {/* Main image with enhanced styling */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform transition-all duration-700 group-hover:scale-105 group-hover:rotate-1">
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80&auto=format&fit=crop" 
                  alt="Volunteers helping community" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 via-transparent to-transparent"></div>
                
                {/* Animated border */}
                <div className="absolute inset-0 border-4 border-transparent group-hover:border-amber-300/50 rounded-3xl transition-all duration-700"></div>
              </div>
              
              {/* Floating icons with Heroicons */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <HeartSolidIcon className="absolute top-10 left-10 h-8 w-8 text-red-400 animate-[floatUp_8s_ease-in-out_infinite] opacity-80" />
                <StarSolidIcon className="absolute top-20 right-20 h-7 w-7 text-yellow-300 animate-[floatUp_10s_ease-in-out_infinite_1s] opacity-80" />
                <HeartSolidIcon className="absolute bottom-20 left-20 h-9 w-9 text-pink-400 animate-[floatUp_12s_ease-in-out_infinite_2s] opacity-80" />
                <StarSolidIcon className="absolute bottom-32 right-10 h-6 w-6 text-amber-300 animate-[floatUp_9s_ease-in-out_infinite_1.5s] opacity-80" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-cyan-400/30 to-teal-500/30 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>
          </div>
        </div>

        {/* Scroll indicator - more prominent with custom design */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce cursor-pointer group" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <div className="text-center">
            <p className="text-amber-200 text-sm font-bold mb-1 uppercase tracking-widest group-hover:text-amber-100 transition-colors">Khám phá thêm</p>
            <div className="flex gap-1 justify-center">
              <div className="w-1 h-1 bg-amber-300 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-amber-300 rounded-full animate-pulse delay-100"></div>
              <div className="w-1 h-1 bg-amber-300 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/30 blur-xl rounded-full animate-ping"></div>
            <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-full shadow-lg group-hover:shadow-2xl transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsSection = () => {
    const [ref, isVisible] = useScrollAnimation(0.2);

    return (
      <div ref={ref} className="relative py-24 bg-gradient-to-b from-white via-teal-50/30 to-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 animate-[backgroundMove_20s_linear_infinite]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-16 scale-95'
          }`}>
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full mb-6 shadow-md">
              <BoltIcon className="h-5 w-5 text-teal-600" />
              <span className="text-teal-700 font-bold tracking-wide uppercase text-sm">Tác động của chúng tôi</span>
            </div>
            <h2 className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl mb-4">
              Những con số
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">ấn tượng</span>
            </h2>
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-16 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full"></div>
              <div className="w-16 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full"></div>
            </div>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className={`group relative bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 overflow-hidden shadow-2xl rounded-3xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-700 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-24 scale-90'
              }`} style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="p-8 relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mb-4 shadow-lg">
                      <UserGroupIcon className="h-12 w-12 text-white" strokeWidth={2.5} />
                    </div>
                    <dt className="text-sm font-bold text-teal-100 uppercase tracking-widest mb-3">
                      Tình nguyện viên
                    </dt>
                    <dd className="text-6xl font-black text-white group-hover:scale-110 transition-transform duration-300 mb-2">
                      2,500+
                    </dd>
                    <p className="text-teal-100 text-xs font-medium">Đang hoạt động tích cực</p>
                  </div>
                </div>
              </div>

              <div className={`group relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 overflow-hidden shadow-2xl rounded-3xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-700 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-24 scale-90'
              }`} style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="p-8 relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mb-4 shadow-lg">
                    <CalendarDaysIcon className="h-12 w-12 text-white" strokeWidth={2.5} />
                  </div>
                  <dt className="text-sm font-bold text-emerald-100 uppercase tracking-widest mb-3">
                    Sự kiện tổ chức
                  </dt>
                  <dd className="text-6xl font-black text-white group-hover:scale-110 transition-transform duration-300 mb-2">
                    150+
                  </dd>
                  <p className="text-emerald-100 text-xs font-medium">Thành công rực rỡ</p>
                </div>
              </div>
            </div>

            <div className={`group relative bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 overflow-hidden shadow-2xl rounded-3xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-700 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-24 scale-90'
              }`} style={{ transitionDelay: isVisible ? '450ms' : '0ms' }}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="p-8 relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mb-4 shadow-lg">
                      <BuildingOffice2Icon className="h-12 w-12 text-white" strokeWidth={2.5} />
                    </div>
                    <dt className="text-sm font-bold text-amber-100 uppercase tracking-widest mb-3">
                      Tổ chức đối tác
                    </dt>
                    <dd className="text-6xl font-black text-white group-hover:scale-110 transition-transform duration-300 mb-2">
                      50+
                    </dd>
                    <p className="text-amber-100 text-xs font-medium">Tin tưởng và đồng hành</p>
                  </div>
                </div>
              </div>

              <div className={`group relative bg-gradient-to-br from-blue-500 via-cyan-500 to-cyan-600 overflow-hidden shadow-2xl rounded-3xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-700 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-24 scale-90'
              }`} style={{ transitionDelay: isVisible ? '600ms' : '0ms' }}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="p-8 relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mb-4 shadow-lg">
                      <GlobeAltIcon className="h-12 w-12 text-white" strokeWidth={2.5} />
                    </div>
                    <dt className="text-sm font-bold text-cyan-100 uppercase tracking-widest mb-3">
                      Tỉnh thành
                    </dt>
                    <dd className="text-6xl font-black text-white group-hover:scale-110 transition-transform duration-300 mb-2">
                      12
                    </dd>
                    <p className="text-cyan-100 text-xs font-medium">Phủ sóng toàn quốc</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FeaturesSection = () => {
    const [ref, isVisible] = useScrollAnimation(0.2);

    return (
      <div ref={ref} className="relative py-16 overflow-hidden">
        {/* Background with volunteer image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=80&auto=format&fit=crop" 
            alt="Features background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`lg:text-center mb-12 transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-16 scale-95'
          }`}>
            <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">Tính năng</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Tại sao chọn VolunteerHub?
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className={`relative bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-700 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100 rotate-0' 
                  : 'opacity-0 translate-y-20 scale-95 -rotate-1'
              }`} style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}>
                <div className="absolute -top-5 left-6 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl leading-6 font-bold text-gray-900">Tìm kiếm dễ dàng</h3>
                  <p className="mt-3 text-base text-gray-600">
                    Tìm kiếm sự kiện theo danh mục, địa điểm, thời gian. Bộ lọc thông minh giúp bạn tìm đúng hoạt động phù hợp.
                  </p>
                </div>
              </div>

              <div className={`relative bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-700 ease-out ${
              isVisible 
                ? 'opacity-100 translate-y-0 scale-100 rotate-0' 
                : 'opacity-0 translate-y-20 scale-95 rotate-1'
            }`} style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
              <div className="absolute -top-5 left-6 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-6">
                <h3 className="text-xl leading-6 font-bold text-gray-900">Đăng ký nhanh chóng</h3>
                <p className="mt-3 text-base text-gray-600">
                  Chỉ cần vài click để đăng ký tham gia sự kiện. Nhận thông báo và cập nhật về hoạt động bạn quan tâm.
                </p>
              </div>
            </div>

            <div className={`relative bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-700 ease-out ${
              isVisible 
                ? 'opacity-100 translate-y-0 scale-100 rotate-0' 
                : 'opacity-0 translate-y-20 scale-95 -rotate-1'
            }`} style={{ transitionDelay: isVisible ? '450ms' : '0ms' }}>
              <div className="absolute -top-5 left-6 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="mt-6">
                <h3 className="text-xl leading-6 font-bold text-gray-900">Cộng đồng kết nối</h3>
                <p className="mt-3 text-base text-gray-600">
                  Kết nối với những người cùng chung tâm huyết. Xây dựng mạng lưới bạn bè và đồng nghiệp tình nguyện.
                </p>
              </div>
            </div>

            <div className={`relative bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-700 ease-out ${
              isVisible 
                ? 'opacity-100 translate-y-0 scale-100 rotate-0' 
                : 'opacity-0 translate-y-20 scale-95 rotate-1'
            }`} style={{ transitionDelay: isVisible ? '600ms' : '0ms' }}>
              <div className="absolute -top-5 left-6 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="mt-6">
                <h3 className="text-xl leading-6 font-bold text-gray-900">Theo dõi tiến độ</h3>
                <p className="mt-3 text-base text-gray-600">
                  Theo dõi số giờ tình nguyện, sự kiện đã tham gia. Xây dựng hồ sơ tình nguyện viên chuyên nghiệp.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CTASection = () => {
    const [ref, isVisible] = useScrollAnimation(0.2);

    return (
      <div ref={ref} className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920&q=80&auto=format&fit=crop" 
            alt="CTA background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-cyan-900/90 to-teal-900/95"></div>
        </div>
        
        <div className="relative max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-extrabold text-white sm:text-4xl drop-shadow-lg transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-16 scale-90'
          }`}>
            <span className="block">Sẵn sàng tạo thay đổi?</span>
            <span className="block mt-2">Bắt đầu hành trình tình nguyện ngày hôm nay.</span>
          </h2>
          <p className={`mt-4 text-lg leading-6 text-gray-100 drop-shadow transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-12 scale-95'
          }`} style={{ transitionDelay: isVisible ? '250ms' : '0ms' }}>
            Tham gia cộng đồng VolunteerHub để kết nối, chia sẻ và tạo ra những tác động tích cực cho xã hội.
          </p>
          <div className={`mt-8 flex justify-center space-x-4 transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-16 scale-90'
          }`} style={{ transitionDelay: isVisible ? '500ms' : '0ms' }}>
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-teal-700 bg-white hover:bg-gray-50 shadow-xl transition-all hover:shadow-2xl hover:scale-105"
                >
                  Đăng ký miễn phí
                </Link>
                <Link
                  to="/events"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-teal-700 shadow-xl transition-all hover:shadow-2xl hover:scale-105"
                >
                  Khám phá sự kiện
                </Link>
              </>
            ) : (
              <Link
                to="/events"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-teal-700 bg-white hover:bg-gray-50 shadow-xl transition-all hover:shadow-2xl hover:scale-105"
              >
                Khám phá sự kiện mới
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen custom-scrollbar">
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #f0fdfa, #e0f2fe);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #14b8a6, #06b6d4);
          border-radius: 10px;
          border: 2px solid #f0fdfa;
          box-shadow: 0 2px 6px rgba(20, 184, 166, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0d9488, #0891b2);
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.5);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, #0f766e, #0e7490);
        }
      `}</style>
      
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
