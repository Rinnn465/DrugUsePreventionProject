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
        id: "q1",
        text: "Bạn đã từng sử dụng chất kích thích trong đời chưa",
        options: [
          { id: "a", text: "Có", value: 1 },
          { id: "b", text: "Không", value: 2 },
        ]
      },
      {
        id: "q2",
        text: "Trong 3 tháng qua, bạn có từng nghĩ đến việc sử dụng chất kích thích không?",
        options: [
          { id: "a", text: "Chưa bao giờ", value: 0 },
          { id: "b", text: "Một hoặc hai lần", value: 2 },
          { id: "c", text: "Hàng tháng", value: 3 },
          { id: "d", text: "Hàng tuần", value: 4 },
          { id: "e", text: "Hàng ngày hoặc gần như hàng ngày", value: 6 }
        ]
      },
      {
        id: "q3",
        text: "Bạn có biết tác hại của chất ma túy đối với sức khỏe và cuộc sống không?",
        options: [
          { id: "a", text: "Có", value: 0 },
          { id: "b", text: "Không", value: 2 }
        ]
      },
      {
        id: "q4",
        text: "Bạn có từng bị người thân, bạn bè hoặc người khác khuyên không nên sử dụng chất ma túy không?",
        options: [
          { id: "aa", text: "Có", value: 0 },
          { id: "b", text: "Không", value: 2 },
        ]
      },
      {
        id: "q5",
        text: "Bạn có cảm thấy áp lực từ bạn bè hoặc môi trường xung quanh để thử hoặc sử dụng chất ma túy không",
        options: [
          { id: "a", text: "Không bao giờ", value: 0 },
          { id: "b", text: "Thỉnh Thoảng ", value: 1 },
          { id: "c", text: "Thường xuyên", value: 2 }
        ]
      },
      {
        id: "q6",
        text: "Bạn có quan tâm hoặc muốn tìm hiểu thêm về cách phòng tránh hoặc từ chối sử dụng chất ma túy không",
        options: [
          { id: "a", text: "Không bao giờ", value: 0 },
          { id: "b", text: "Hiếm khi", value: 1 },
          { id: "c", text: "Thỉnh thoảng", value: 2 },
          { id: "d", text: "Thường xuyên", value: 3 },
          { id: "e", text: "Hầu như luôn luôn", value: 4 }
        ]
      },
      {
        id: "q7",
        text: "Bạn có từng cảm thấy lo lắng hoặc bối rối khi nghĩ về việc sử dụng chất ma túy không",
        options: [
          { id: "a", text: "Không bao giờ", value: 0 },
          { id: "b", text: "Thỉnh thoảng", value: 1 },
          { id: "c", text: "Thường xuyên", value: 2 },
        ]
      },
      {
        id: "q8",
        text: "Bạn có tìm hiểu vấn đề pháp lý nào liên quan đến việc sử dụng các chất gây nghiện đó không?",
        options: [
          { id: "a", text: "Không bao giờ", value: 0 },
          { id: "b", text: "Thỉnh thoảng", value: 1 },
          { id: "c", text: "Thường xuyên", value: 2 }
        ]
      }
    ]

  },
  {
    id: 2,
    title: "Bài trắc nghiệm CRAFFT",
    description: "Một công cụ sàng lọc ngắn dành cho thanh thiếu niên để đánh giá mức độ rủi ro liên quan đến rượu và các chất gây nghiện khác.",
    questionCount: 6,
    timeToComplete: 3,
    audiences: ["Học Sinh", "Sinh viên"],
    color: "primary",
    questions: [
      {
        id: "q1",
        text: "Bạn có từng bị bạn bè mời hay ép sử dụng ma túy không",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có", value: 1 }
        ]
      },
      {
        id: "q2",
        text: "Bạn có thường xuyên cảm thấy buồn chán hoặc cô đơn kéo dài mà không tìm được ai chia sẻ không?",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có", value: 1 }
        ]
      },
      {
        id: "q3",
        text: "Bạn có gặp khó khăn khi nói 'không' khi bạn bè mời sử dụng ma túy không?",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có", value: 1 }
        ]
      },
      {
        id: "q4",
        text: "Trong gia đình bạn có ai từng sử dụng ma túy không không?",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có", value: 1 }
        ]
      },
      {
        id: "q5",
        text: "Bạn có thường xuyên cảm thấy lo âu, căng thẳng hoặc có triệu chầm cảm nhẹ không?",
        options: [
          { id: "a", text: "Không", value: 0 },
          { id: "b", text: "Có", value: 1 }
        ]
      },
      {
        id: "q6",
        text: "bạn có cho rằng việc mua hay tiếp cận ma túy trong khu vực mình sống rất dễ dàng không?",
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
    questionCount: 8,
    timeToComplete: 5,
    audiences: ["Phụ huynh", "Giáo viên"],
    color: "primary",
    questions: [
      {
        id: "q1",
        text: "Bạn có biết ma túy là gì và tác hại của nó đối với sức khỏe, tâm lý và tương lai của con trẻ?",
        options: [
          { id: "a", text: "Rất rõ, tôi thường tìm hiểu và cập nhật thông tin", value: 0 },
          { id: "b", text: "Biết sơ qua nhưng chưa hiểu sâu", value: 1 },
          { id: "c", text: "Không rõ hoặc chưa quan tâm", value: 2 },
        ]
      },
      {
        id: "q2",
        text: "Bạn có thường xuyên trao đổi, nói chuyện với con về các vấn đề liên quan đến ma túy, tệ nạn xã hội không?",
        options: [
          { id: "a", text: "Luôn luôn", value: 0 },
          { id: "b", text: "Thường xuyên", value: 1 },
          { id: "c", text: "Thỉnh thoảng", value: 2 },
          { id: "d", text: "Hiếm khi hoặc không bao giờ", value: 3 }
        ]
      },
      {
        id: "q3",
        text: "Khi phát hiện con có dấu hiệu thay đổi về hành vi, bạn sẽ:",
        options: [
          { id: "a", text: "Lắng nghe, hỏi han và tìm hiểu nguyên nhân", value: 0 },
          { id: "b", text: "Phân tích, nhắc nhở nhưng chưa tìm hiểu kỹ", value: 1 },
          { id: "c", text: "Phớt lờ hoặc trách mắng ngay lập tức", value: 2 },
        ]
      },
      {
        id: "q4",
        text: "Bạn có biết cách nhận biết các dấu hiệu nghi ngờ con sử dụng ma túy hoặc các chất gây nghiện không?",
        options: [
          { id: "a", text: "Rất rõ, có thể nhận biết sớm", value: 0 },
          { id: "b", text: "Biết một số dấu hiệu cơ bản", value: 1 },
          { id: "c", text: "Không biết dấu hiệu nào", value: 2 },
        ]
      },
      {
        id: "q5",
        text: "Bạn có quản lý, giám sát việc bạn bè, hoạt động vui chơi, học tập của con không",
        options: [
          { id: "a", text: "Quản lý chặt chẽ, biết rõ bạn bè và hoạt động của con", value: 0 },
          { id: "b", text: "Quản lý nhưng chưa chặt chẽ, còn nhiều điều chưa rõ", value: 1 },
          { id: "c", text: "Không quản lý hoặc ít quan tâm", value: 2 },
        ]
      },
      {
        id: "q6",
        text: "Bạn có biết những nơi, tổ chức hoặc cơ quan nào có thể giúp đỡ nếu con bạn gặp vấn đề về ma túy?",
        options: [
          { id: "a", text: "Biết rõ và sẵn sàng liên hệ khi cần", value: 0 },
          { id: "b", text: "Biết sơ qua nhưng chưa từng liên hệ", value: 1 },
          { id: "c", text: "Không biết nơi nào để giúp", value: 2 },
        ]
      },
      {
        id: "q7",
        text: "Bạn có sẵn sàng phối hợp với nhà trường, cộng đồng và các cơ quan chức năng trong việc phòng chống ma túy cho con không?",
        options: [
          { id: "a", text: "Rất sẵn sàng và đã tham gia các hoạt động", value: 0 },
          { id: "b", text: "Có ý định nhưng chưa tham gia nhiều", value: 1 },
          { id: "c", text: "Không quan tâm hoặc không muốn tham gia", value: 2 },
        ]
      },
      {
        id: "q8",
        text: "Bạn có tạo môi trường gia đình lành mạnh, gần gũi, để con cảm thấy an toàn chia sẻ mọi điều không?",
        options: [
          { id: "a", text: "Luôn cố gắng xây dựng môi trường như vậy", value: 0 },
          { id: "b", text: "Đôi khi làm được, đôi khi chưa", value: 1 },
          { id: "c", text: "Ít quan tâm hoặc không biết cách tạo môi trường như vậy", value: 2 },
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
        id: "q1",
        text: "Bạn có biết trường học hiện đang triển khai những hoạt động nào nhằm nâng cao nhận thức về phòng chống ma túy cho học sinh??",
        options: [
          { id: "a", text: "Tổ chức các buổi tuyên truyền, nói chuyện chuyên đề", value: 0 },
          { id: "b", text: "Lồng ghép giáo dục phòng chống ma túy trong các môn học", value: 1 },
          { id: "c", text: "Tổ chức các hoạt động ngoại khóa, hội thi, sân khấu hóa", value: 2 },
          { id: "d", text: "Chưa biết hoặc không có hoạt động nào", value: 3 }
        ]
      },
      {
        id: "q2",
        text: "Theo bạn, việc giáo dục phòng chống ma túy trong nhà trường có quan trọng không?",
        options: [
          { id: "a", text: "Rất quan trọng, là nhiệm vụ cấp thiết để bảo vệ học sinh", value: 0 },
          { id: "b", text: "Quan trọng nhưng chưa phải ưu tiên hàng đầu", value: 1 },
          { id: "c", text: "Không quan trọng hoặc không cần thiết", value: 2 },
        ]
      },
      {
        id: "q3",
        text: "Bạn đánh giá thế nào về vai trò của giáo viên và cán bộ quản lý trong công tác phòng chống ma túy tại trường?",
        options: [
          { id: "a", text: "Rất tích cực, chủ động phối hợp với các lực lượng chức năn", value: 0 },
          { id: "b", text: "Có vai trò nhưng còn hạn chế, chưa đồng bộ", value: 1 },
          { id: "c", text: "Ít quan tâm hoặc chưa tham gia nhiều", value: 2 },
        ]
      },
      {
        id: "q4",
        text: "Nhà trường có tổ chức các chương trình đào tạo, tập huấn kỹ năng phòng chống ma túy cho học sinh không??",
        options: [
          { id: "a", text: "Có, thường xuyên và bài bản", value: 0 },
          { id: "b", text: "Có nhưng chưa thường xuyên, chưa đầy đủ", value: 1 },
          { id: "c", text: "Không hoặc rất ít", value: 2 },
        ]
      },
      {
        id: "q5",
        text: "Bạn có biết trường học phối hợp với các cơ quan chức năng (công an, y tế, đoàn thể) trong phòng chống ma túy không?",
        options: [
          { id: "a", text: "Có, phối hợp chặt chẽ và hiệu quả", value: 0 },
          { id: "b", text: "Có nhưng chưa thường xuyên, chưa hiệu quả", value: 1 },
          { id: "c", text: "Không biết hoặc không có phối hợp", value: 2 },
        ]
      },
      {
        id: "q6",
        text: "Bạn đánh giá thế nào về hiệu quả của các chương trình phòng chống ma túy trong trường học hiện nay?",
        options: [
          { id: "a", text: "Rất hiệu quả, giúp học sinh nâng cao nhận thức và kỹ năng", value: 0 },
          { id: "b", text: "Có hiệu quả nhưng chưa bền vững, cần cải thiện", value: 1 },
          { id: "c", text: "Ít hiệu quả hoặc chưa thấy tác động rõ rệt", value: 2 },
        ]
      },
      {
        id: "q7",
        text: "Theo bạn, học sinh có được trang bị đầy đủ kỹ năng để nhận biết và từ chối ma túy trong môi trường học đường không?",
        options: [
          { id: "a", text: "Có, qua các bài học kỹ năng sống và hoạt động ngoại khóa", value: 0 },
          { id: "b", text: "Chưa đầy đủ, cần tăng cường thêm", value: 1 },
          { id: "c", text: "Không hoặc rất ít được trang bị", value: 2 },
        ]
      },
      {
        id: "q8",
        text: "Bạn có đồng ý rằng việc xây dựng môi trường học đường lành mạnh, không ma túy là trách nhiệm của toàn bộ cán bộ, giáo viên và học sinh?",
        options: [
          { id: "a", text: "Đồng ý hoàn toàn", value: 0 },
          { id: "b", text: "Đồng ý một phần", value: 1 },
          { id: "c", text: "Không đồng ý hoặc không rõ", value: 2 },
        ]
      }
    ],

   }
];
