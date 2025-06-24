import { Assessment } from '../types/Assessment';

export const assessmentData: Assessment[] = [
  {
    id: 1,
    title: "Bài trắc nghiệm ASSIST",
    description: "Bài kiểm tra sàng lọc mức độ sử dụng chất gây nghiện (ASSIST) giúp xác định các kiểu sử dụng các chất gây nghiện và các nguy cơ liên quan.",
    questionCount: 8,
    timeToComplete: 5,
    audiences: ["Người lớn", "Sinh viên", "Học sinh"],
    color: "primary",
    questions: [
      {
        id: 1,
        text: "Trong cuộc sống của bạn, bạn đã từng sử dụng những chất nào sau đây? (Chỉ tính việc sử dụng không vì mục đích y tế)",
        type: "checkbox",
        options: [
          { id: "a", text: "Các sản phẩm thuốc lá", value: 1 },
          { id: "b", text: "Đồ uống có cồn", value: 2 },
          { id: "c", text: "Cần sa", value: 3 },
          { id: "d", text: "Cocain", value: 4 },
          { id: "e", text: "Chất kích thích loại amphetamine", value: 5 },
          { id: "f", text: "Chất hít", value: 6 },
          { id: "g", text: "Thuốc an thần hoặc thuốc ngủ", value: 7 },
          { id: "h", text: "Chất gây ảo giác", value: 8 },
          { id: "i", text: "Thuốc phiện (opioid)", value: 9 },
          { id: "j", text: "Không có", value: 0 }
        ]
      },
      {
        id: 2,
        text: "Trong ba tháng qua, bạn đã sử dụng các chất gây nghiện đã nêu ở mức độ nào?",
        options: [
          { id: "aa", text: "Chưa bao giờ", value: 0 },
          { id: "bb", text: "Một hoặc hai lần", value: 2 },
          { id: "cc", text: "Hàng tháng", value: 3 },
          { id: "dd", text: "Hàng tuần", value: 4 },
          { id: "ee", text: "Hàng ngày hoặc gần như hàng ngày", value: 6 }
        ]
      },
      {
        id: 3,
        text: "Bạn có cảm thấy ham muốn mạnh mẽ hoặc thôi thúc phải sử dụng các chất gây nghiện đó không?",
        options: [
          { id: "aa", text: "Không bao giờ", value: 0 },
          { id: "bb", text: "Hiếm khi", value: 2 },
          { id: "cc", text: "Thỉnh thoảng", value: 3 },
          { id: "dd", text: "Thường xuyên", value: 4 },
          { id: "ee", text: "Hầu như luôn luôn", value: 6 }
        ]
      },
      {
        id: 4,
        text: "Trong ba tháng qua, việc sử dụng các chất gây nghiện có gây ra hậu quả nào cho bạn không (như sức khỏe, tâm lý, gia đình, học tập hoặc công việc)?",
        options: [
          { id: "aa", text: "Không bao giờ", value: 0 },
          { id: "bb", text: "Hiếm khi", value: 2 },
          { id: "cc", text: "Thỉnh thoảng", value: 4 },
          { id: "dd", text: "Thường xuyên", value: 6 },
          { id: "ee", text: "Hầu như luôn luôn", value: 8 }
        ]
      },
      {
        id: 5,
        text: "Người thân, bạn bè hoặc người khác có lo lắng về việc bạn sử dụng các chất gây nghiện không?",
        options: [
          { id: "aa", text: "Không bao giờ", value: 0 },
          { id: "bb", text: "Có, nhưng chỉ trong năm trước", value: 3 },
          { id: "cc", text: "Có, trong ba tháng qua", value: 6 }
        ]
      },
      {
        id: 6,
        text: "Bạn đã từng cố gắng nhưng không thể kiểm soát hoặc giảm bớt việc sử dụng các chất gây nghiện đó chưa?",
        options: [
          { id: "aa", text: "Không bao giờ", value: 0 },
          { id: "bb", text: "Hiếm khi", value: 2 },
          { id: "cc", text: "Thỉnh thoảng", value: 4 },
          { id: "dd", text: "Thường xuyên", value: 6 },
          { id: "ee", text: "Hầu như luôn luôn", value: 8 }
        ]
      },
      {
        id: 7,
        text: "Bạn đã từng sử dụng các chất gây nghiện đó trong tình huống có thể gây nguy hiểm không (ví dụ: lái xe, vận hành máy móc)?",
        options: [
          { id: "aa", text: "Không bao giờ", value: 0 },
          { id: "bb", text: "Hiếm khi", value: 2 },
          { id: "cc", text: "Thỉnh thoảng", value: 4 },
          { id: "dd", text: "Thường xuyên", value: 6 },
          { id: "ee", text: "Hầu như luôn luôn", value: 8 }
        ]
      },
      {
        id: 8,
        text: "Bạn có gặp phải bất kỳ vấn đề pháp lý nào liên quan đến việc sử dụng các chất gây nghiện đó không?",
        options: [
          { id: "aa", text: "Không bao giờ", value: 0 },
          { id: "bb", text: "Có, nhưng chỉ trong năm trước", value: 4 },
          { id: "cc", text: "Có, trong ba tháng qua", value: 8 }
        ]
      }
    ]

  },
  {
    id: 2,
    title: "Công cụ Sàng lọc CRAFFT",
    description: "Một công cụ sàng lọc ngắn dành cho thanh thiếu niên để đánh giá mức độ rủi ro liên quan đến rượu và các chất gây nghiện khác.",
    questionCount: 6,
    timeToComplete: 3,
    audiences: ["Học Sinh ", "Sinh viên"],
    color: "primary",
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
      },
      {
        id: 3,
        text: "Bạn có bao giờ sử dụng rượu hoặc ma túy khi đang ở một mình không?",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có", value: 1 }
        ]
      },
      {
        id: 4,
        text: "Bạn có bao giờ quên những việc đã làm khi đang sử dụng rượu hoặc ma túy không?",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có", value: 1 }
        ]
      },
      {
        id: 5,
        text: "Bạn có bao giờ bị người thân hoặc bạn bè khuyên nên giảm sử dụng rượu hoặc ma túy không?",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có", value: 1 }
        ]
      },
      {
        id: 6,
        text: "Bạn có bao giờ gặp rắc rối khi sử dụng rượu hoặc ma túy không?",
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
    questionCount: 7,
    timeToComplete: 5,
    audiences: ["Phụ huynh", "Giáo viên"],
    color: "primary",
    questions: [
      {
        id: 1,
        text: "Bạn đánh giá mức độ giao tiếp của gia đình về rủi ro của việc sử dụng các chất gây nghiện như thế nào?",
        options: [
          { id: "a", text: "Chúng tôi thảo luận chủ đề này một cách cởi mở và thường xuyên", value: 0 },
          { id: "b", text: "Chúng tôi thỉnh thoảng nói về chủ đề này", value: 1 },
          { id: "c", text: "Chúng tôi hiếm khi đề cập đến chủ đề này", value: 2 },
          { id: "d", text: "Chúng tôi không bao giờ nói về chủ đề này", value: 3 }
        ]
      },
      {
        id: 2,
        text: "Bạn có đặt ra các giới hạn rõ ràng và nhất quán cho hành vi của con không?",
        options: [
          { id: "a", text: "Luôn luôn", value: 0 },
          { id: "b", text: "Thường xuyên", value: 1 },
          { id: "c", text: "Thỉnh thoảng", value: 2 },
          { id: "d", text: "Hiếm khi hoặc không bao giờ", value: 3 }
        ]
      },
      {
        id: 3,
        text: "Bạn có theo dõi các hoạt động của con khi ở ngoài nhà không?",
        options: [
          { id: "a", text: "Biết rõ con ở đâu, với ai và làm gì", value: 0 },
          { id: "b", text: "Có theo dõi nhưng không thường xuyên", value: 1 },
          { id: "c", text: "Ít khi biết con làm gì hoặc ở đâu", value: 2 },
          { id: "d", text: "Không biết gì về hoạt động ngoài nhà của con", value: 3 }
        ]
      },
      {
        id: 4,
        text: "Bạn có cảm thấy mối quan hệ giữa bạn và con là tích cực và gắn bó không?",
        options: [
          { id: "a", text: "Rất gắn bó", value: 0 },
          { id: "b", text: "Khá gắn bó", value: 1 },
          { id: "c", text: "Thỉnh thoảng có khoảng cách", value: 2 },
          { id: "d", text: "Thường xuyên căng thẳng hoặc xa cách", value: 3 }
        ]
      },
      {
        id: 5,
        text: "Bạn có biết nhóm bạn bè của con là ai và ảnh hưởng của họ như thế nào không?",
        options: [
          { id: "a", text: "Rất rõ, và bạn tin tưởng nhóm bạn đó", value: 0 },
          { id: "b", text: "Biết một số người, nhưng không rõ mối quan hệ", value: 1 },
          { id: "c", text: "Không biết rõ hoặc không tin tưởng nhóm bạn của con", value: 2 },
          { id: "d", text: "Hoàn toàn không biết con chơi với ai", value: 3 }
        ]
      },
      {
        id: 6,
        text: "Bạn có làm gương tốt về việc sử dụng các chất có thể gây nghiện (rượu, thuốc lá, thuốc kê đơn, v.v.) không?",
        options: [
          { id: "a", text: "Tôi không sử dụng hoặc sử dụng rất có trách nhiệm", value: 0 },
          { id: "b", text: "Thỉnh thoảng sử dụng nhưng có kiểm soát", value: 1 },
          { id: "c", text: "Sử dụng thường xuyên và không luôn làm gương tốt", value: 2 },
          { id: "d", text: "Sử dụng nhiều và thiếu kiểm soát", value: 3 }
        ]
      },
      {
        id: 7,
        text: "Trong gia đình, có thành viên nào hiện đang sử dụng các chất gây nghiện hoặc có tiền sử nghiện không?",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có, nhưng đã cai nghiện thành công", value: 1 },
          { id: "c", text: "Có, đang trong quá trình cai", value: 2 },
          { id: "d", text: "Có, vẫn đang sử dụng", value: 3 }
        ]
      },
    ]
  },
  {
    id: 4,
    title: "Đánh giá môi trường học đường",
    description: "Dành cho giáo viên để đánh giá môi trường phòng ngừa của trường học và xác định các lĩnh vực cần cải thiện.",
    questionCount: 8,
    timeToComplete: 6,
    audiences: ["Giáo viên"],
    color: "primary",
    questions: [
      {
        id: 1,
        text: "Trường của bạn có chương trình phòng ngừa sử dụng các chất gây nghiện đầy đủ không?",
        options: [
          { id: "a", text: "Có, được triển khai tốt", value: 0 },
          { id: "b", text: "Có, nhưng triển khai còn hạn chế", value: 1 },
          { id: "c", text: "Chỉ có chương trình tối thiểu hoặc lỗi thời", value: 2 },
          { id: "d", text: "Không có chương trình phòng ngừa", value: 3 }
        ]
      },
      {
        id: 2,
        text: "Giáo viên có được đào tạo về cách nhận diện và xử lý sớm các hành vi nguy cơ liên quan đến các chất gây nghiện không?",
        options: [
          { id: "a", text: "Được đào tạo bài bản và cập nhật thường xuyên", value: 0 },
          { id: "b", text: "Được đào tạo nhưng không thường xuyên", value: 1 },
          { id: "c", text: "Được đào tạo sơ sài hoặc không đầy đủ", value: 2 },
          { id: "d", text: "Không được đào tạo", value: 3 }
        ]
      },
      {
        id: 3,
        text: "Trường có chính sách rõ ràng và thực thi nghiêm túc về phòng chống sử dụng các chất gây nghiện không?",
        options: [
          { id: "a", text: "Có chính sách rõ ràng và áp dụng hiệu quả", value: 0 },
          { id: "b", text: "Có chính sách nhưng thực thi chưa nghiêm", value: 1 },
          { id: "c", text: "Chính sách chưa rõ ràng", value: 2 },
          { id: "d", text: "Không có chính sách", value: 3 }
        ]
      },
      {
        id: 4,
        text: "Học sinh có được giáo dục định kỳ về kỹ năng sống và phòng ngừa nguy cơ không?",
        options: [
          { id: "a", text: "Có, nằm trong chương trình chính khóa", value: 0 },
          { id: "b", text: "Có, nhưng chỉ là hoạt động ngoại khóa", value: 1 },
          { id: "c", text: "Chỉ tổ chức một vài lần trong năm", value: 2 },
          { id: "d", text: "Không có hoạt động giáo dục này", value: 3 }
        ]
      },
      {
        id: 5,
        text: "Trường có phối hợp với phụ huynh trong các hoạt động giáo dục phòng ngừa không?",
        options: [
          { id: "a", text: "Có sự phối hợp chặt chẽ và thường xuyên", value: 0 },
          { id: "b", text: "Có nhưng chưa thường xuyên", value: 1 },
          { id: "c", text: "Chỉ thông tin một chiều", value: 2 },
          { id: "d", text: "Không có sự phối hợp", value: 3 }
        ]
      },
      {
        id: 6,
        text: "Học sinh có thể tiếp cận dịch vụ tư vấn học đường khi gặp khó khăn về tâm lý hoặc hành vi không?",
        options: [
          { id: "a", text: "Có đầy đủ và dễ tiếp cận", value: 0 },
          { id: "b", text: "Có nhưng chưa phổ biến với học sinh", value: 1 },
          { id: "c", text: "Có nhưng thiếu nhân lực hoặc chuyên môn", value: 2 },
          { id: "d", text: "Không có dịch vụ tư vấn", value: 3 }
        ]
      },
      {
        id: 7,
        text: "Nhà trường có theo dõi và đánh giá định kỳ các yếu tố rủi ro trong môi trường học đường không?",
        options: [
          { id: "a", text: "Có hệ thống theo dõi chặt chẽ và đánh giá thường xuyên", value: 0 },
          { id: "b", text: "Có nhưng đánh giá chưa định kỳ", value: 1 },
          { id: "c", text: "Theo dõi không có hệ thống rõ ràng", value: 2 },
          { id: "d", text: "Không có hoạt động theo dõi đánh giá", value: 3 }
        ]
      },
      {
        id: 8,
        text: "Trường có tạo môi trường tích cực, hỗ trợ phát triển toàn diện cho học sinh không?",
        options: [
          { id: "a", text: "Môi trường tích cực và hỗ trợ toàn diện", value: 0 },
          { id: "b", text: "Có nỗ lực nhưng còn thiếu nhất quán", value: 1 },
          { id: "c", text: "Môi trường học chưa khuyến khích sự phát triển", value: 2 },
          { id: "d", text: "Môi trường không tích cực, thiếu hỗ trợ", value: 3 }
        ]
      }
    ]

  }
];
