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
    lesson: lessonData.filter(lesson => lesson.id === 1)
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
    lesson: lessonData.filter(lesson => lesson.id === 2)
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
    lesson: lessonData.filter(lesson => lesson.id === 3)
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
    lesson: lessonData.filter(lesson => lesson.id === 4)
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
    lesson: lessonData.filter(lesson => lesson.id === 5)
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
    lesson: lessonData.filter(lesson => lesson.id === 6)
  }
];
