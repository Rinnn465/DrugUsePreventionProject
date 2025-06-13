import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Activity, Calendar, Users, ArrowRight, Award } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import StatCard from '../components/common/StatCard';
import TestimonialCard from '../components/home/TestimonialCard';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Stats Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-primary-600 via-blue-600 to-primary-800 bg-clip-text text-transparent leading-normal py-2">
              Thành Tựu Của Chúng Tôi
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-primary-500 to-blue-500 mx-auto mb-12 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Những con số ấn tượng phản ánh cam kết và tác động tích cực của chúng tôi trong cộng đồng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full blur-xl opacity-70"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">10,000+</div>
                <div className="text-gray-600 text-lg font-medium">Thành viên đã tham gia khóa học</div>
              </div>
            </div>

            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-xl opacity-70"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">50+</div>
                <div className="text-gray-600 text-lg font-medium">Các khóa học online chất lượng</div>
              </div>
            </div>

            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full blur-xl opacity-70"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">5,000+</div>
                <div className="text-gray-600 text-lg font-medium">Chương trình tư vấn tâm lý</div>
              </div>
            </div>

            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full blur-xl opacity-70"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">100+</div>
                <div className="text-gray-600 text-lg font-medium">Chuyên viên được cấp chứng chỉ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 bg-white relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-blue-600 rounded-3xl blur-2xl opacity-20"></div>
                <img
                  src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Volunteers working together"
                  className="relative rounded-3xl shadow-2xl object-cover w-full h-[600px] border-4 border-white"
                />
                {/* Overlay Badge */}
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold">9+</div>
                    <div className="text-sm">Năm hoạt động</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="max-w-2xl">
                <div className="mb-8">
                  <span className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    📋 Về Chúng Tôi
                  </span>
                  <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary-700 via-blue-600 to-primary-800 bg-clip-text text-transparent leading-tight">
                    Sứ Mệnh Cao Cả
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full mb-8"></div>
                </div>

                <div className="space-y-6 mb-10">
                  <p className="text-xl text-gray-700 leading-relaxed">
                    Là một tổ chức hoạt động dựa trên tinh thần tình nguyện, chúng tôi cam kết 
                    <span className="font-semibold text-primary-700"> phòng chống lạm dụng ma túy</span> 
                    thông qua giáo dục, hỗ trợ và sự tham gia tích cực của cộng đồng.
                  </p>
                  
                  <p className="text-xl text-gray-700 leading-relaxed">
                    Sứ mệnh của chúng tôi là 
                    <span className="font-semibold text-blue-700"> trao quyền cho mỗi cá nhân</span> 
                    bằng kiến thức và kỹ năng cần thiết để đưa ra những quyết định đúng đắn liên quan đến ma túy và các chất gây nghiện.
                  </p>

                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-500 p-6 rounded-r-2xl">
                    <p className="text-lg text-gray-700 leading-relaxed italic">
                      "Thông qua các chương trình toàn diện, khóa học trực tuyến và dịch vụ tư vấn chuyên nghiệp, 
                      chúng tôi hướng tới việc giảm thiểu tình trạng sử dụng ma túy trong cộng đồng."
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/about"
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 text-lg font-semibold hover:scale-105 hover:-translate-y-1"
                  >
                    <span>Tìm hiểu thêm</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/community-programs"
                    className="group inline-flex items-center gap-3 bg-white border-2 border-primary-200 text-primary-700 px-8 py-4 rounded-2xl shadow-lg hover:bg-primary-50 transition-all duration-300 text-lg font-semibold hover:scale-105 hover:-translate-y-1"
                  >
                    <span>Chương trình cộng đồng</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block bg-gradient-to-r from-primary-100 to-blue-100 text-primary-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              🌟 Chương Trình Nổi Bật
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-primary-700 via-blue-600 to-green-600 bg-clip-text text-transparent leading-normal py-2">
              Hoạt động cộng đồng
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Chúng tôi tổ chức nhiều chương trình truyền thông và giáo dục nhằm nâng cao nhận thức 
              và cung cấp những nguồn lực thiết thực cho cộng đồng.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="School Awareness Program"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-primary-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  🎓 Giáo dục
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-primary-700">
                  Workshop Môi Trường Học Đường
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Những buổi workshop được tổ chức trực tiếp nhằm giúp học sinh nhận thức rõ về các vấn đề liên quan đến ma túy.
                </p>
                <div className="flex items-center justify-between">
                  <Link 
                    to="/community-programs" 
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold text-lg"
                  >
                    <span>Tìm hiểu thêm</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Users className="h-4 w-4" />
                    <span>500+ học sinh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/7551442/pexels-photo-7551442.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Parent Training Program"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  👪 Gia đình
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-green-700">
                  Hỗ Trợ Phụ Huynh
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Những buổi tuyên truyền giúp phụ huynh phát hiện sớm dấu hiệu và hướng dẫn cách hỗ trợ con em hiệu quả.
                </p>
                <div className="flex items-center justify-between">
                  <Link 
                    to="/community-programs" 
                    className="inline-flex items-center gap-2 text-green-600 font-semibold text-lg"
                  >
                    <span>Tìm hiểu thêm</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Users className="h-4 w-4" />
                    <span>300+ gia đình</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Community Outreach"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  🌍 Cộng đồng
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-purple-700">
                  Ngày Hội Cộng Đồng
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Sự kiện mở rộng với nhiều hoạt động, tài liệu giáo dục và sàng lọc dành cho mọi người trong cộng đồng.
                </p>
                <div className="flex items-center justify-between">
                  <Link 
                    to="/community-programs" 
                    className="inline-flex items-center gap-2 text-purple-600 font-semibold text-lg"
                  >
                    <span>Tìm hiểu thêm</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Users className="h-4 w-4" />
                    <span>1000+ người</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link
              to="/community-programs"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 text-xl font-bold hover:scale-105 hover:-translate-y-2 animate-gradient"
            >
              <span>Khám phá tất cả chương trình</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gradient-to-br from-white via-gray-50 to-primary-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              💬 Phản Hồi Tích Cực
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
              Câu Chuyện Truyền Cảm Hứng
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Lắng nghe tiếng nói của những người đã tham gia chương trình và cảm nhận sự thay đổi tích cực trong cuộc sống.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Testimonial 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100 relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full blur-xl opacity-70"></div>
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 leading-relaxed italic">
                    "Khóa học đã giúp tôi hiểu rõ hơn về tác hại của ma túy và cách phòng tránh. 
                    Tôi cảm thấy tự tin hơn khi nói chuyện với bạn bè về vấn đề này."
                  </blockquote>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src="https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Trường Hạnh"
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-primary-100"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary-500 to-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Trường Hạnh, 17</div>
                    <div className="text-primary-600 text-sm font-semibold">🎓 Học sinh</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100 relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-xl opacity-70"></div>
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 leading-relaxed italic">
                    "Buổi học đã giúp tôi nhận ra tầm quan trọng của việc giáo dục con cái về ma túy. 
                    Tôi cảm thấy mình có thêm công cụ để hỗ trợ con trong việc phòng tránh."
                  </blockquote>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src="https://images.pexels.com/photos/774095/pexels-photo-774095.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Nguyễn Thị Ba"
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-green-100"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Nguyễn Thị Ba, 42</div>
                    <div className="text-green-600 text-sm font-semibold">👪 Phụ huynh</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100 relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full blur-xl opacity-70"></div>
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full"></div>
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 leading-relaxed italic">
                    "Tài liệu và các hoạt động trong khóa học rất hữu ích. 
                    Tôi đã học được nhiều điều mới và cảm thấy có trách nhiệm hơn trong việc phòng chống ma túy."
                  </blockquote>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src="https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Trần Quốc Nam"
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-purple-100"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Trần Quốc Nam, 38</div>
                    <div className="text-purple-600 text-sm font-semibold">👨‍🏫 Giáo viên</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl p-12 shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">
                Bạn có muốn chia sẻ câu chuyện của mình?
              </h3>
              <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                Hãy để lại phản hồi và trở thành nguồn cảm hứng cho những người khác trong cộng đồng
              </p>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 bg-white text-primary-700 px-8 py-4 rounded-2xl shadow-lg hover:bg-gray-50 transition-all duration-300 text-lg font-semibold hover:scale-105 hover:-translate-y-1"
              >
                <span>Chia sẻ câu chuyện</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;