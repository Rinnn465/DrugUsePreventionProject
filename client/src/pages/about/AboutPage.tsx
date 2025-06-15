import React from 'react';
import { Heart, Award, Users, BookOpen, Target, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Phần mở đầu */}
      <section className="bg-primary-600 text-white py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-blue-500">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 drop-shadow-lg animate-fade-in">Về Tổ Chức Chúng Tôi</h1>
            <p className="text-2xl text-primary-100 mb-4 animate-fade-in delay-100">
              Cam kết phòng chống lạm dụng ma túy thông qua giáo dục, hỗ trợ và sự tham gia của cộng đồng
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-primary-100/40 animate-fade-in">
              <div className="mb-6 bg-primary-100/80 p-4 rounded-full w-fit shadow-lg">
                <Target className="h-10 w-10 text-primary-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-primary-700">Sứ Mệnh Của Chúng Tôi</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Sứ mệnh của chúng tôi là ngăn ngừa lạm dụng và nghiện chất thông qua giáo dục dựa trên bằng chứng,
                can thiệp sớm và hỗ trợ từ cộng đồng. Chúng tôi nỗ lực trao quyền cho mọi người bằng kiến thức
                và kỹ năng để đưa ra quyết định đúng đắn về các chất gây nghiện.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-primary-100/40 animate-fade-in delay-100">
              <div className="mb-6 bg-primary-100/80 p-4 rounded-full w-fit shadow-lg">
                <Globe className="h-10 w-10 text-primary-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-primary-700">Tầm Nhìn Của Chúng Tôi</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Chúng tôi hình dung một cộng đồng nơi mọi người được trang bị kiến thức, kỹ năng và sự hỗ trợ
                để sống khỏe mạnh, không ma túy. Mục tiêu của chúng tôi là tạo ra môi trường ưu tiên phòng ngừa,
                đảm bảo can thiệp sớm và hỗ trợ kịp thời cho những người cần giúp đỡ.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-8 text-center text-primary-700 animate-fade-in">Câu Chuyện Của Chúng Tôi</h2>
            <div className="prose prose-lg max-w-none text-gray-700 text-lg animate-fade-in delay-100">
              <p>
                Tổ chức của chúng tôi được thành lập vào năm 2015 bởi một nhóm chuyên gia y tế, giáo dục và
                những người vận động cộng đồng, những người nhận thấy cần có tài nguyên phòng chống ma túy hiệu quả hơn.
                Từ một sáng kiến nhỏ mang tính địa phương, chúng tôi đã phát triển thành một chương trình toàn diện phục vụ
                hàng ngàn người mỗi năm.
              </p>
              <p>
                Những năm đầu, chúng tôi tập trung vào các chương trình giáo dục tại trường học. Khi tổ chức phát triển
                và thu được kinh nghiệm, chúng tôi đã mở rộng phương pháp tiếp cận để bao gồm tài nguyên trực tuyến,
                phát triển chuyên môn cho giáo viên và nhân viên y tế, dịch vụ hỗ trợ gia đình và các sáng kiến tiếp cận cộng đồng.
              </p>
              <p>
                Hiện nay, chúng tôi hoạt động theo mô hình phòng ngừa toàn diện, giải quyết các yếu tố phức tạp
                dẫn đến sử dụng chất ở nhiều nhóm tuổi và cộng đồng khác nhau. Các chương trình dựa trên bằng chứng
                của chúng tôi luôn được đánh giá và cải tiến để đảm bảo hiệu quả trong bối cảnh luôn thay đổi.
              </p>
              <p>
                Chúng tôi tự hào về sự phát triển và tác động của mình, nhưng công việc vẫn tiếp tục. Với các thách thức
                và xu hướng sử dụng chất liên tục thay đổi, chúng tôi cam kết đổi mới, hợp tác và kết nối cộng đồng
                nhằm thực hiện sứ mệnh của mình.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold mb-12 text-center text-primary-700 animate-fade-in">Giá Trị Cốt Lõi Của Chúng Tôi</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-primary-100/40 text-center animate-fade-in">
              <div className="mx-auto mb-6 bg-primary-100/80 p-4 rounded-full w-fit shadow-lg">
                <Heart className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary-700">Lòng Trắc Ẩn</h3>
              <p className="text-gray-700 text-lg">
                Chúng tôi tiếp cận công việc với sự cảm thông và thấu hiểu, nhận biết rằng vấn đề sử dụng chất
                là vấn đề phức tạp ảnh hưởng đến các cá nhân và cộng đồng theo nhiều cách khác nhau.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-primary-100/40 text-center animate-fade-in delay-100">
              <div className="mx-auto mb-6 bg-secondary-100/80 p-4 rounded-full w-fit shadow-lg">
                <Award className="h-10 w-10 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-secondary-700">Chất Lượng</h3>
              <p className="text-gray-700 text-lg">
                Chúng tôi cam kết cung cấp các chương trình và dịch vụ chất lượng cao nhất, áp dụng phương pháp
                dựa trên bằng chứng và cải tiến liên tục để đạt kết quả tốt nhất.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-primary-100/40 text-center animate-fade-in delay-200">
              <div className="mx-auto mb-6 bg-accent-100/80 p-4 rounded-full w-fit shadow-lg">
                <Users className="h-10 w-10 text-accent-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-accent-700">Hợp Tác</h3>
              <p className="text-gray-700 text-lg">
                Chúng tôi tin vào sức mạnh của sự hợp tác và làm việc chặt chẽ với trường học, nhân viên y tế,
                tổ chức cộng đồng và gia đình để xây dựng chiến lược phòng ngừa toàn diện.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-primary-100/40 text-center animate-fade-in delay-300">
              <div className="mx-auto mb-6 bg-success-100/80 p-4 rounded-full w-fit shadow-lg">
                <BookOpen className="h-10 w-10 text-success-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-success-700">Giáo Dục</h3>
              <p className="text-gray-700 text-lg">
                Chúng tôi tin rằng kiến thức là sức mạnh và cam kết cung cấp thông tin chính xác, dễ tiếp cận
                giúp mọi người đưa ra quyết định sáng suốt.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-primary-100/40 text-center animate-fade-in delay-400">
              <div className="mx-auto mb-6 bg-warning-100/80 p-4 rounded-full w-fit shadow-lg">
                <Target className="h-10 w-10 text-warning-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-warning-700">Phòng Ngừa</h3>
              <p className="text-gray-700 text-lg">
                Chúng tôi ưu tiên các phương pháp chủ động nhằm xây dựng các yếu tố bảo vệ
                và giảm thiểu các yếu tố rủi ro trước khi các vấn đề về sử dụng chất xuất hiện.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-primary-100/40 text-center animate-fade-in delay-500">
              <div className="mx-auto mb-6 bg-error-100/80 p-4 rounded-full w-fit shadow-lg">
                <Globe className="h-10 w-10 text-error-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-error-700">Bao Gồm</h3>
              <p className="text-gray-700 text-lg">
                Chúng tôi thiết kế các chương trình phù hợp với văn hóa và dễ tiếp cận
                cho nhiều đối tượng khác nhau, nhận thấy rằng phòng ngừa cần được điều chỉnh
                theo từng cộng đồng cụ thể.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold mb-4 text-center text-primary-700 animate-fade-in">Ban Lãnh Đạo Của Chúng Tôi</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto text-lg animate-fade-in delay-100">
            Đội ngũ đa dạng của chúng tôi kết hợp chuyên môn trong giáo dục, tâm lý học, y tế cộng đồng
            và phát triển cộng đồng để định hướng hoạt động của tổ chức.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-white via-blue-50 to-primary-50 rounded-3xl shadow-2xl border-2 border-primary-100/40 p-8 text-center animate-fade-in">
              <img
                src="https://images.pexels.com/photos/5393594/pexels-photo-5393594.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Dr. Maria Anderson"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-primary-200 shadow-lg"
              />
              <h3 className="text-2xl font-bold text-primary-700 mb-2">TS. Maria Anderson</h3>
              <p className="text-primary-600 text-lg mb-4">Giám Đốc Điều Hành</p>
              <p className="text-gray-700 text-lg">
                TS. Anderson có hơn 20 năm kinh nghiệm trong lĩnh vực y tế công cộng và khoa học phòng ngừa.
                Trước đây bà là chuyên gia phòng chống tại Viện Quốc gia về Lạm dụng Ma túy (NIDA).
              </p>
            </div>

            <div className="bg-gradient-to-br from-white via-blue-50 to-primary-50 rounded-3xl shadow-2xl border-2 border-primary-100/40 p-8 text-center animate-fade-in delay-100">
              <img
                src="https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="David Kim"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-primary-200 shadow-lg"
              />
              <h3 className="text-2xl font-bold text-primary-700 mb-2">David Kim</h3>
              <p className="text-primary-600 text-lg mb-4">Giám Đốc Chương Trình</p>
              <p className="text-gray-700 text-lg">
                David phụ trách phát triển và triển khai các chương trình phòng ngừa.
                Anh có nền tảng trong giáo dục và tổ chức cộng đồng, đặc biệt chú trọng đến phát triển thanh thiếu niên.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white via-blue-50 to-primary-50 rounded-3xl shadow-2xl border-2 border-primary-100/40 p-8 text-center animate-fade-in delay-200">
              <img
                src="https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Dr. Samantha Lee"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-primary-200 shadow-lg"
              />
              <h3 className="text-2xl font-bold text-primary-700 mb-2">TS. Samantha Lee</h3>
              <p className="text-primary-600 text-lg mb-4">Trưởng Bộ Phận Giáo Dục</p>
              <p className="text-gray-700 text-lg">
                TS. Lee là chuyên gia về giáo dục phòng ngừa và phát triển chương trình đào tạo cho giáo viên, học sinh và phụ huynh.
                Bà có nhiều năm kinh nghiệm trong lĩnh vực giáo dục và phát triển cộng đồng.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
