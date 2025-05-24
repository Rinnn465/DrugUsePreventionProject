import { Course } from '../types/Course';
import { lessonData } from './lessonData';

export const courseData: Course[] = [
  {
    id: 1,
    title: "Nhận Thức Về Ma Túy Dành Cho Thiếu Niên",
    description: "Tìm hiểu về các rủi ro của việc sử dụng ma túy, các chất thường gặp và cách hiệu quả để chống lại áp lực từ bạn bè.",
    category: "Giáo dục",
    audience: "Học sinh",
    duration: "4 giờ",
    enrolledCount: 2456,
    isCertified: true,
    risk: 'cao',
    imageUrl: "https://images.pexels.com/photos/8197525/pexels-photo-8197525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Tìm Hiểu Các Loại Chất", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 2, title: "Xác Định Các Yếu Tố Nguy Cơ", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 2) },
      { id: 3, title: "Phát Triển Kỹ Năng Từ Chối", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 3) },
      { id: 4, title: "Xây Dựng Lựa Chọn Lành Mạnh", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 4) },
      { id: 5, title: "Bài Kiểm Tra Cuối Khóa", duration: "30 phút", lesson: lessonData.filter(lesson => lesson.id === 5) }
    ],
  },
  {
    id: 2,
    title: "Chiến Lược Phòng Ngừa Dành Cho Phụ Huynh",
    description: "Khóa học giúp phụ huynh nhận biết các dấu hiệu cảnh báo và có các cuộc trò chuyện hiệu quả về ma túy với con cái.",
    category: "Phòng ngừa",
    audience: "Phụ huynh",
    duration: "6 giờ",
    enrolledCount: 1839,
    isCertified: true,
    risk: 'thấp',
    imageUrl: "https://images.pexels.com/photos/7282588/pexels-photo-7282588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Hiểu Về Phát Triển Tuổi Vị Thành Niên", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 2, title: "Các Yếu Tố Nguy Cơ và Bảo Vệ", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 2) },
      { id: 3, title: "Chiến Lược Giao Tiếp", duration: "90 phút", lesson: lessonData.filter(lesson => lesson.id === 3) },
      { id: 4, title: "Thiết Lập Ranh Giới", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 4) },
      { id: 5, title: "Nhận Biết Dấu Hiệu Cảnh Báo", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 5) },
      { id: 6, title: "Bài Kiểm Tra Cuối Khóa", duration: "30 phút", lesson: lessonData.filter(lesson => lesson.id === 6) }
    ]
  },
  {
    id: 3,
    title: "Kỹ Thuật Phòng Ngừa Trong Lớp Học",
    description: "Trang bị cho giáo viên các công cụ và phương pháp để giáo dục phòng ngừa và thúc đẩy quyết định lành mạnh trong lớp học.",
    category: "Giáo dục",
    audience: "Giáo viên",
    duration: "8 giờ",
    enrolledCount: 1245,
    isCertified: true,
    risk: 'trung bình',
    imageUrl: "https://images.pexels.com/photos/5212703/pexels-photo-5212703.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Tạo Môi Trường Lớp Học Hỗ Trợ", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 2, title: "Chiến Lược Phòng Ngừa Phù Hợp Độ Tuổi", duration: "90 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 3, title: "Lồng Ghép Phòng Ngừa Vào Chương Trình", duration: "90 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 4, title: "Xác Định Học Sinh Có Nguy Cơ", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 5, title: "Kỹ Thuật Can Thiệp", duration: "120 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 6, title: "Đánh Giá và Cấp Chứng Nhận", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 1) }
    ]
  },
  {
    id: 4,
    title: "Xây Dựng Khả Năng Chống Chịu Cho Thanh Thiếu Niên",
    description: "Tìm hiểu các kỹ thuật giúp trẻ em và thanh thiếu niên xây dựng khả năng chống chịu – yếu tố then chốt phòng ngừa sử dụng chất gây nghiện.",
    category: "Phòng ngừa",
    audience: "Học sinh",
    duration: "3 giờ",
    enrolledCount: 978,
    isCertified: false,
    risk: 'thấp',
    imageUrl: "https://images.pexels.com/photos/6382633/pexels-photo-6382633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Tìm Hiểu Về Khả Năng Chống Chịu", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 2, title: "Kỹ Thuật Tự Điều Chỉnh", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 3, title: "Xây Dựng Mối Quan Hệ Tích Cực", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 4, title: "Đối Phó Với Căng Thẳng", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 1) }
    ]
  },
  {
    id: 5,
    title: "Đào Tạo Hỗ Trợ Viên Đồng Trang Lứa",
    description: "Huấn luyện học sinh trở thành người hỗ trợ đồng trang lứa để dẫn dắt thảo luận phòng ngừa và hỗ trợ bạn bè.",
    category: "Lãnh đạo",
    audience: "Học sinh",
    duration: "5 giờ",
    enrolledCount: 756,
    isCertified: true,
    risk: 'cao',
    imageUrl: "https://images.pexels.com/photos/8363020/pexels-photo-8363020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Vai Trò Của Hỗ Trợ Viên Đồng Trang Lứa", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 2, title: "Kỹ Năng Giao Tiếp và Lắng Nghe", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 3, title: "Dẫn Dắt Các Cuộc Thảo Luận Nhóm", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 4, title: "Nhận Biết Dấu Hiệu Cảnh Báo", duration: "45 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 5, title: "Hỗ Trợ Bạn Bè Gặp Khó Khăn", duration: "60 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 6, title: "Bài Thực Hành Hỗ Trợ", duration: "30 phút", lesson: lessonData.filter(lesson => lesson.id === 1) }
    ]
  },
  {
    id: 6,
    title: "Chiến Lược Phòng Ngừa Cộng Đồng",
    description: "Khóa học toàn diện cho các nhà lãnh đạo cộng đồng về cách phát triển và triển khai chương trình phòng ngừa hiệu quả.",
    category: "Lãnh đạo",
    audience: "Cộng đồng",
    duration: "10 giờ",
    enrolledCount: 542,
    isCertified: true,
    risk: 'cao',
    imageUrl: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    modules: [
      { id: 1, title: "Đánh Giá Nhu Cầu Cộng Đồng", duration: "90 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 2, title: "Mô Hình Phòng Ngừa Dựa Trên Bằng Chứng", duration: "120 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 3, title: "Xây Dựng Liên Minh Cộng Đồng", duration: "90 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 4, title: "Tạo Dựng Chương Trình Bền Vững", duration: "120 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 5, title: "Đo Lường Hiệu Quả Chương Trình", duration: "90 phút", lesson: lessonData.filter(lesson => lesson.id === 1) },
      { id: 6, title: "Phát Triển Nguồn Lực và Gây Quỹ", duration: "90 phút", lesson: lessonData.filter(lesson => lesson.id === 1) }
    ]
  }
];
