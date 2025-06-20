import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Award, Users, MessageCircle, CheckCircle, Play, ChevronLeft, ChevronRight, Shield } from 'lucide-react';

// Dữ liệu cho các slide
const heroSlides = [
  {
    id: 1,
    title: "Khóa Học Phòng Chống Ma Túy",
    subtitle: "Cách Thức Hoạt Động",
    description: "Tham gia học tập và nâng cao kiến thức về tác hại của ma túy, cách phòng chống và hỗ trợ cộng đồng hiệu quả.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    gradient: "from-cyan-400 to-blue-500",
    steps: [
      { icon: BookOpen, title: "Đăng ký khóa học", desc: "Tham gia các khóa học trực tuyến miễn phí về phòng chống ma túy" },
      { icon: Users, title: "Tham gia cộng đồng", desc: "Kết nối với những người có cùng mục tiêu xây dựng cộng đồng lành mạnh" },
      { icon: Award, title: "Nhận chứng chỉ", desc: "Hoàn thành khóa học và nhận chứng chỉ được công nhận" }
    ],
    primaryBtn: { text: "Bắt đầu học ngay", link: "/courses", icon: Play },
    secondaryBtn: { text: "Tìm hiểu thêm", link: "/about", icon: ArrowRight }
  },
  {
    id: 2,
    title: "Đánh Giá & Tư Vấn",
    subtitle: "Hỗ Trợ Chuyên Nghiệp",
    description: "Nhận được sự hỗ trợ và tư vấn từ các chuyên gia tâm lý, bác sĩ và các tình nguyện viên có kinh nghiệm.",
    image: "https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    gradient: "from-teal-400 to-blue-600",
    steps: [
      { icon: MessageCircle, title: "Tư vấn trực tuyến", desc: "Nhận tư vấn miễn phí từ các chuyên gia tâm lý 24/7" },
      { icon: Users, title: "Đánh giá tình trạng", desc: "Đánh giá mức độ rủi ro và đưa ra lời khuyên phù hợp" },
      { icon: CheckCircle, title: "Theo dõi tiến độ", desc: "Theo dõi quá trình phục hồi và cải thiện tích cực" }
    ],
    primaryBtn: { text: "Đăng ký tư vấn", link: "/appointments", icon: MessageCircle },
    secondaryBtn: { text: "Xem đánh giá", link: "/assessments", icon: ArrowRight }
  },
  {
    id: 3,
    title: "Cộng Đồng Hỗ Trợ",
    subtitle: "Kết Nối & Chia Sẻ",
    description: "Tham gia cộng đồng những người cùng chí hướng, chia sẻ kinh nghiệm và hỗ trợ lẫn nhau trong hành trình phòng chống ma túy.",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    gradient: "from-blue-500 to-indigo-600",
    steps: [
      { icon: Users, title: "Tham gia nhóm", desc: "Kết nối với cộng đồng những người có cùng mục tiêu" },
      { icon: MessageCircle, title: "Chia sẻ kinh nghiệm", desc: "Chia sẻ câu chuyện và học hỏi từ những người khác" },
      { icon: Award, title: "Thành tích cá nhân", desc: "Ghi nhận những thành tích và tiến bộ của bản thân" }
    ],
    primaryBtn: { text: "Tham gia cộng đồng", link: "/community-programs", icon: Users },
    secondaryBtn: { text: "Xem hoạt động", link: "/article", icon: ArrowRight }
  }
];

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto slide chuyển
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setIsAnimating(false);
    }, 300);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 300);
  };

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative min-h-[900px] bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-green-400 to-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">

          {/* Left Side - Content */}
          <div className={`space-y-8 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>

            {/* Main Title */}
            <div className="space-y-4 pb-4">
              <h1 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-primary-600 via-blue-600 to-primary-800 bg-clip-text text-transparent leading-loose pb-4">
                {slide.title}
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">
                {slide.subtitle}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                {slide.description}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {slide.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${slide.gradient} rounded-xl flex items-center justify-center`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{index + 1}. {step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to={slide.primaryBtn.link}
                className={`group inline-flex items-center justify-center space-x-3 bg-gradient-to-r ${slide.gradient} text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg font-semibold`}
              >
                <slide.primaryBtn.icon className="h-5 w-5" />
                <span>{slide.primaryBtn.text}</span>
              </Link>

              <Link
                to={slide.secondaryBtn.link}
                className="group inline-flex items-center justify-center space-x-3 bg-white/80 backdrop-blur-sm border-2 border-primary-200 text-primary-700 px-8 py-4 rounded-2xl shadow-lg hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg font-semibold"
              >
                <span>{slide.secondaryBtn.text}</span>
                <slide.secondaryBtn.icon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Slide Indicators */}
            <div className="flex space-x-3 pt-8">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-12 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? `bg-gradient-to-r ${slide.gradient}` 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

              {/* Main Image Container */}
              <div className="relative">
                <div className={`absolute -inset-4 bg-gradient-to-r ${slide.gradient} rounded-3xl blur-2xl opacity-20`}></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-200">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-96 object-cover rounded-2xl shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/5029857/pexels-photo-5029857.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
                    }}
                  />
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </div>


          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;