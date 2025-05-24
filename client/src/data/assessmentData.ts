import { Assessment } from '../types/Assessment';

export const assessmentData: Assessment[] = [
  {
    id: 1,
    title: "Công cụ sàng lọc ASSIST",
    description: "Bài kiểm tra sàng lọc mức độ sử dụng chất gây nghiện (ASSIST) giúp xác định các kiểu sử dụng chất và các nguy cơ liên quan.",
    questionCount: 8,
    timeToComplete: 5,
    audiences: ["Người lớn", "Thanh niên", "Thiếu niên"],
    color: "primary",
    questions: [
      {
        id: 1,
        text: "Trong cuộc sống của bạn, bạn đã từng sử dụng những chất nào sau đây? (Chỉ tính việc sử dụng không vì mục đích y tế)",
        type: "checkbox",
        options: [
          { id: "a", text: "Các sản phẩm thuốc lá", value: 0 },
          { id: "b", text: "Đồ uống có cồn", value: 1 },
          { id: "c", text: "Cần sa", value: 2 },
          { id: "d", text: "Cocain", value: 3 },
          { id: "e", text: "Chất kích thích loại amphetamine", value: 4 },
          { id: "f", text: "Chất hít", value: 5 },
          { id: "g", text: "Thuốc an thần hoặc thuốc ngủ", value: 6 },
          { id: "h", text: "Chất gây ảo giác", value: 7 },
          { id: "i", text: "Thuốc phiện (opioid)", value: 8 },
        ]
      },
      {
        id: 2,
        text: "Trong ba tháng qua, bạn đã sử dụng các chất đã nêu ở mức độ nào?",
        options: [
          { id: "aa", text: "Chưa bao giờ", value: 0 },
          { id: "bb", text: "Một hoặc hai lần", value: 2 },
          { id: "cc", text: "Hàng tháng", value: 3 },
          { id: "dd", text: "Hàng tuần", value: 4 },
          { id: "ee", text: "Hàng ngày hoặc gần như hàng ngày", value: 6 }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Sàng lọc CRAFFT",
    description: "Một công cụ sàng lọc ngắn dành cho thanh thiếu niên để đánh giá mức độ rủi ro liên quan đến rượu và các chất gây nghiện khác.",
    questionCount: 6,
    timeToComplete: 3,
    audiences: ["Thiếu niên", "Thanh niên"],
    color: "secondary",
    questions: [
      {
        id: 1,
        text: "Bạn đã từng ngồi trên xe do ai đó (bao gồm cả bạn) lái khi người đó đang 'phê' hoặc đã sử dụng rượu hay ma túy chưa?",
        options: [
          { id: "a", text: "Chưa", value: 0 },
          { id: "b", text: "Rồi", value: 1 }
        ]
      },
      {
        id: 2,
        text: "Bạn có bao giờ sử dụng rượu hoặc ma túy để thư giãn, cảm thấy tốt hơn về bản thân, hoặc để hoà nhập với mọi người không?",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có", value: 1 }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Đánh giá nguy cơ dành cho phụ huynh",
    description: "Giúp phụ huynh đánh giá các yếu tố nguy cơ tiềm ẩn trong môi trường gia đình và cách nuôi dạy con.",
    questionCount: 15,
    timeToComplete: 8,
    audiences: ["Phụ huynh", "Người giám hộ"],
    color: "accent",
    questions: [
      {
        id: 1,
        text: "Bạn đánh giá mức độ giao tiếp của gia đình về rủi ro của việc sử dụng chất gây nghiện như thế nào?",
        options: [
          { id: "a", text: "Chúng tôi thảo luận chủ đề này một cách cởi mở và thường xuyên", value: 0 },
          { id: "b", text: "Chúng tôi thỉnh thoảng nói về chủ đề này", value: 1 },
          { id: "c", text: "Chúng tôi hiếm khi đề cập đến chủ đề này", value: 2 },
          { id: "d", text: "Chúng tôi không bao giờ nói về chủ đề này", value: 3 }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Đánh giá môi trường học đường",
    description: "Dành cho giáo viên để đánh giá môi trường phòng ngừa của trường học và xác định các lĩnh vực cần cải thiện.",
    questionCount: 20,
    timeToComplete: 10,
    audiences: ["Giáo viên", "Ban giám hiệu nhà trường"],
    color: "success",
    questions: [
      {
        id: 1,
        text: "Trường của bạn có chương trình phòng ngừa sử dụng chất đầy đủ không?",
        options: [
          { id: "a", text: "Có, được triển khai tốt", value: 0 },
          { id: "b", text: "Có, nhưng triển khai còn hạn chế", value: 1 },
          { id: "c", text: "Chỉ có chương trình tối thiểu hoặc lỗi thời", value: 2 },
          { id: "d", text: "Không có chương trình phòng ngừa", value: 3 }
        ]
      }
    ]
  }
];
