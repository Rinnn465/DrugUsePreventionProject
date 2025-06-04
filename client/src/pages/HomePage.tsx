import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Activity, Calendar, Users, ArrowRight, ShieldCheck, Award, Book } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import StatCard from '../components/common/StatCard';
import TestimonialCard from '../components/home/TestimonialCard';
import BlogPostCard from '../components/blog/BlogPostCard';

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />

      {/* Quick Access Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 transform transition duration-300 hover:scale-105">
              <div className="mb-4 bg-primary-100 p-3 rounded-full w-fit">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Các khóa học online</h3>
              <p className="text-gray-600 mb-4">
                Tham gia các khóa học phòng chống ma túy tùy theo độ tuổi
              </p>
              <Link to="/courses" className="h-[76px] text-primary-600 font-medium flex items-center gap-2 group">
                Xem các khóa học
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 transform transition duration-300 hover:scale-105">
              <div className="mb-4 bg-secondary-100 p-3 rounded-full w-fit">
                <Activity className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Đánh giá rủi ro sử dụng ma túy</h3>
              <p className="text-gray-600 mb-4">
                Thực hiện cấc bài kiểm tra như đánh giá như ASSIST và CRAFFT để xác định nguy cơ sử dụng ma túy.
              </p>
              <Link to="/assessments" className="text-secondary-600 font-medium flex items-center gap-2 group">
                Tham gia đánh giá
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 transform transition duration-300 hover:scale-105">
              <div className="mb-4 bg-accent-100 p-3 rounded-full w-fit">
                <Calendar className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 ">Chuyên viên hỗ trợ</h3>
              <p className="h-[76px] text-gray-600 mb-4">
                Đặt lịch hẹn với chuyên viên tư vấn để nhận hỗ trợ.
              </p>
              <Link to="/appointments" className="text-accent-600 font-medium flex items-center gap-2 group">
                Đặt lịch hẹn
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Thành tựu</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatCard
              icon={<Users className="h-8 w-8" />}
              value="10,000+"
              label="thành viên đã tham gia khóa học"
            />
            <StatCard
              icon={<BookOpen className="h-8 w-8" />}
              value="50+"
              label="Các khóa học online"
            />
            <StatCard
              icon={<Calendar className="h-8 w-8" />}
              value="5,000+"
              label="Các chương trình tư vấn tâm lý"
            />
            <StatCard
              icon={<Award className="h-8 w-8" />}
              value="100+"
              label="Chuyên viên tư vấn được cấp chứng chỉ đào tạo"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img
                src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Volunteers working together"
                className="rounded-lg shadow-lg object-cover w-full h-[400px]"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Thông tin về tổ chức</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Là một tổ chức hoạt động dựa trên tinh thần tình nguyện, cam kết phòng chống lạm dụng ma túy thông qua giáo dục, hỗ trợ và sự tham gia của cộng đồng.
                Sứ mệnh của chúng tôi là trao quyền cho mỗi cá nhân bằng kiến thức và kỹ năng cần thiết để đưa ra những quyết định đúng đắn liên quan đến ma túy và các chất gây nghiện.


              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Thông qua các chương trình toàn diện, khóa học trực tuyến và dịch vụ tư vấn, chúng tôi hướng tới việc giảm thiểu tình trạng sử dụng ma túy trong cộng đồng và hỗ trợ những người có nguy cơ cao bằng
                cách tiếp cận mang tính phòng ngừa, tập trung vào giáo dục và can thiệp sớm.
              </p>
              <Link
                to="/about"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-primary-700 transition-colors"
              >
                Xem thêm thông tin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Cộng đồng</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Chúng tôi tổ chức nhiều chương trình truyền thông và giáo dục nhằm nâng cao nhận thức và cung cấp những nguồn lực thiết thực cho cộng đồng.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="School Awareness Program"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Workshop ở môi trường học đường</h3>
                <p className="text-gray-600 mb-4">
                  Những buổi workshop được tổ chức trực tiếp nhằm giúp
                  học sinh nhận thức rõ về các vấn đề liên quan đến ma túy.
                </p>
                <Link to="/programs" className="text-primary-600 font-medium">Thông tin chỉ tiết</Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://images.pexels.com/photos/7551442/pexels-photo-7551442.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Parent Training Program"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Phổ cập kiến thức cho bậc phụ huynh</h3>
                <p className="text-gray-600 mb-4">
                  Những buổi tuyên truyền, giúp đỡ giúp phụ huynh phát hiện những dấu hiệu sớm của việc sử dụng ma túy
                </p>
                <Link to="/programs" className="text-primary-600 font-medium">Thông tin chi tiết</Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Community Outreach"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Ngày hội tiếp cận cộng đồng</h3>
                <p className="text-gray-600 mb-4">
                  Sự kiện mở rộng với nhiều hoạt động, tài liệu giáo dục và khám sàng lọc dành cho mọi người trong cộng đồng.
                </p>
                <Link to="/programs" className="text-primary-600 font-medium">Thông tin chi tiết</Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/programs"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-primary-700 transition-colors"
            >
              Xem chương trình
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Những câu chuyện truyền cảm hứng</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Lắng nghe tiếng nói của những người đã tham gia chương trình.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="khóa học đã giúp tôi hiểu rõ hơn về tác hại của ma túy và cách phòng tránh. Tôi cảm thấy tự tin hơn khi nói chuyện với bạn bè về vấn đề này."
              author="Trường Hạnh, 17"
              role="Học sinh"
              imageSrc="https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            />

            <TestimonialCard
              quote="Buôi học đã giúp tôi nhận ra tầm quan trọng của việc giáo dục con cái về ma túy. Tôi cảm thấy mình có thêm công cụ để hỗ trợ con trong việc phòng tránh."
              author="Nguyễn Thị Ba, 42"
              role="Phụ huynh"
              imageSrc="https://images.pexels.com/photos/774095/pexels-photo-774095.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            />

            <TestimonialCard
              quote="Tài liệu và các hoạt động trong khóa học rất hữu ích. Tôi đã học được nhiều điều mới và cảm thấy có trách nhiệm hơn trong việc phòng chống ma túy."
              author="Trần Quốc Nam, 38"
              role="Giáo viên"
              imageSrc="https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            />
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Các bài viết liên quan</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Tiếp cận các thông tin mới nhất về phòng chống ma túy và các vấn đề liên quan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BlogPostCard
              id='1'
              title="Tìm hiểu các yếu tố nguy cơ dẫn đến sử dụng ma túy ở thanh thiếu niên"
              excerpt="Tìm hiểu các yếu tố nguy cơ có thể dẫn đến việc sử dụng ma túy ở thanh thiếu niên và cách phòng ngừa hiệu quả."
              date="June 15, 2025"
              author="Dr. Emily Johnson"
              imageUrl="https://images.pexels.com/photos/7407946/pexels-photo-7407946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              slug="understanding-risk-factors"
            />

            <BlogPostCard
              id='1'
              title="Giao tiếp hiệu quả: Chiến lược nói chuyện với trẻ em về ma túy"
              excerpt="Tìm hiểu các chiến lược giao tiếp hiệu quả với con trẻ"
              date="June 10, 2025"
              author="Thomas Richards, LMFT"
              imageUrl="https://images.pexels.com/photos/7282588/pexels-photo-7282588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              slug="communication-strategies"
            />

            <BlogPostCard
              id='1'
              title="Xây dựng nền tảng: Cách giúp trẻ em tránh xa ma túy"
              excerpt="Khám phá các phương pháp giúp trẻ em phát triển kỹ năng sống và giá trị cá nhân để tránh xa ma túy."
              date="June 5, 2025"
              author="Dr. Marcus Lee"
              imageUrl="https://images.pexels.com/photos/2531353/pexels-photo-2531353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              slug="building-resilience"
            />
          </div>

          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-block bg-white border border-primary-600 text-primary-600 px-6 py-3 rounded-md shadow-sm hover:bg-primary-50 transition-colors"
            >
              Xem thêm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;