import { Lesson } from "../types/Lesson";

export const lessonData: Lesson[] = [
    {
        id: 1,
        title: "Hiểu Về Lạm Dụng Ma Túy",
        briefDescription:
            "Giới thiệu về những nguy hiểm của việc lạm dụng ma túy và tác động của nó đến cá nhân và xã hội.",
        content:
            "Lạm dụng ma túy là hành vi sử dụng thường xuyên các chất gây nghiện hoặc bất hợp pháp. Nó có thể dẫn đến các vấn đề sức khỏe nghiêm trọng, nghiện ngập và thậm chí tử vong. Hiểu được rủi ro và hậu quả của việc lạm dụng ma túy là bước đầu tiên trong việc phòng ngừa. Bài học này sẽ đề cập đến các loại ma túy thường bị lạm dụng, tác hại của chúng và cách nhận biết dấu hiệu lạm dụng.",
        duration: 10,
        videoUrl: "",
        quiz: [
            {
                id: 1,
                question: "Lạm dụng ma túy là gì?",
                options: [
                    { id: 1, text: "Lạm dụng ma túy là việc sử dụng thường xuyên các chất gây nghiện hoặc bất hợp pháp.", value: 1 },
                    { id: 2, text: "Sử dụng thuốc theo chỉ định của bác sĩ.", value: 0 }
                ],
                correctAnswer: "Lạm dụng ma túy là việc sử dụng thường xuyên các chất gây nghiện hoặc bất hợp pháp."
            },
            {
                id: 2,
                question: "Kể tên hai tác hại phổ biến của việc lạm dụng ma túy.",
                options: [
                    { id: 1, text: "Gây nghiện và ảnh hưởng đến sức khỏe.", value: 1 },
                    { id: 2, text: "Tăng khả năng học tập.", value: 0 }
                ],
                correctAnswer: "Gây nghiện và ảnh hưởng đến sức khỏe."
            },
            {
                id: 3,
                question: "Làm thế nào để nhận biết dấu hiệu lạm dụng ma túy ở ai đó?",
                type: "multiple",
                options: [
                    { id: 1, text: "Thay đổi hành vi", value: 1 },
                    { id: 2, text: "Ngoại hình thay đổi", value: 1 },
                    { id: 3, text: "Rút lui khỏi xã hội", value: 1 },
                    { id: 4, text: "Thường xuyên đi học đúng giờ", value: 0 }
                ],
                correctAnswers: [
                    "Thay đổi hành vi",
                    "Ngoại hình thay đổi",
                    "Rút lui khỏi xã hội"
                ]
            }
        ]
    },
    {
        id: 2,
        title: "Tầm Quan Trọng Của Việc Nói Không",
        briefDescription: "Học các chiến lược để chống lại áp lực từ bạn bè và nói không với ma túy.",
        content:
            "Áp lực từ bạn bè là một trong những nguyên nhân chính dẫn đến việc sử dụng ma túy ở giới trẻ. Học cách tự tin nói không là một kỹ năng quan trọng. Bài học này sẽ dạy bạn các kỹ thuật để xử lý áp lực từ bạn bè, xây dựng sự tự tin và đưa ra những lựa chọn lành mạnh.",
        duration: 8,
        videoUrl: "",
        quiz: [
            {
                id: 4,
                question: "Tại sao việc nói không với ma túy lại quan trọng?",
                options: [
                    { id: 1, text: "Giúp bạn hòa nhập với bạn bè.", value: 0 },
                    { id: 2, text: "Giúp bảo vệ sức khỏe và tương lai của bạn.", value: 1 }
                ],
                correctAnswer: "Giúp bảo vệ sức khỏe và tương lai của bạn."
            },
            {
                id: 5,
                question: "Hai chiến lược để chống lại áp lực từ bạn bè là gì?",
                type: "multiple",
                options: [
                    { id: 1, text: "Luyện tập kỹ năng từ chối", value: 1 },
                    { id: 2, text: "Tránh các tình huống rủi ro", value: 1 },
                    { id: 3, text: "Chấp nhận mọi lời mời", value: 0 }
                ],
                correctAnswers: [
                    "Luyện tập kỹ năng từ chối",
                    "Tránh các tình huống rủi ro"
                ]
            },
            {
                id: 6,
                question: "Việc xây dựng sự tự tin giúp phòng chống ma túy như thế nào?",
                options: [
                    { id: 1, text: "Giúp bạn kiên định với quyết định và tránh bị ảnh hưởng xấu.", value: 1 },
                    { id: 2, text: "Giúp bạn dễ tiếp cận ma túy hơn.", value: 0 }
                ],
                correctAnswer: "Giúp bạn kiên định với quyết định và tránh bị ảnh hưởng xấu."
            }
        ]
    },
    {
        id: 3,
        title: "Những Hoạt Động Lành Mạnh Thay Thế Việc Sử Dụng Ma Túy",
        briefDescription: "Khám phá các hoạt động và thói quen tích cực giúp xây dựng lối sống không ma túy.",
        content:
            "Tham gia vào các hoạt động lành mạnh như thể thao, sở thích cá nhân và tình nguyện có thể làm giảm khả năng sử dụng ma túy. Bài học này sẽ bàn về lợi ích của việc giữ cho bản thân năng động, xây dựng các mối quan hệ hỗ trợ và đặt mục tiêu cá nhân.",
        duration: 9,
        videoUrl: "",
        quiz: [
            {
                id: 7,
                question: "Một số hoạt động lành mạnh thay thế việc sử dụng ma túy là gì?",
                type: "multiple",
                options: [
                    { id: 1, text: "Chơi thể thao", value: 1 },
                    { id: 2, text: "Tham gia hoạt động tình nguyện", value: 1 },
                    { id: 3, text: "Theo đuổi sở thích cá nhân", value: 1 },
                    { id: 4, text: "Ở nhà không làm gì", value: 0 }
                ],
                correctAnswers: [
                    "Chơi thể thao",
                    "Tham gia hoạt động tình nguyện",
                    "Theo đuổi sở thích cá nhân"
                ]
            },
            {
                id: 8,
                question: "Việc giữ cơ thể năng động giúp phòng ngừa ma túy như thế nào?",
                options: [
                    { id: 1, text: "Giúp bạn tập trung vào hoạt động tích cực và giảm thời gian rảnh rỗi.", value: 1 },
                    { id: 2, text: "Giúp bạn buồn chán hơn.", value: 0 }
                ],
                correctAnswer: "Giúp bạn tập trung vào hoạt động tích cực và giảm thời gian rảnh rỗi."
            },
            {
                id: 9,
                question: "Tại sao các mối quan hệ hỗ trợ lại quan trọng trong việc phòng chống ma túy?",
                options: [
                    { id: 1, text: "Giúp bạn cảm thấy bị áp lực hơn.", value: 0 },
                    { id: 2, text: "Mang lại sự khích lệ và hỗ trợ đưa ra quyết định đúng đắn.", value: 1 }
                ],
                correctAnswer: "Mang lại sự khích lệ và hỗ trợ đưa ra quyết định đúng đắn."
            }
        ]
    },
    {
        id: 4,
        title: "Nhận Biết Dấu Hiệu Của Nghiện Ma Túy",
        briefDescription: "Học cách nhận biết các dấu hiệu cảnh báo của nghiện ma túy ở bản thân hoặc người khác.",
        content:
            "Việc nhận biết sớm các dấu hiệu của nghiện ma túy có thể giúp ngăn chặn những hậu quả nghiêm trọng hơn. Bài học này sẽ đề cập đến các biểu hiện về thể chất, cảm xúc và hành vi của nghiện, cũng như các bước để tìm kiếm sự giúp đỡ.",
        duration: 10,
        videoUrl: "",
        quiz: [
            {
                id: 10,
                question: "Một số dấu hiệu thể chất của nghiện ma túy là gì?",
                type: "multiple",
                options: [
                    { id: 1, text: "Sụt cân", value: 1 },
                    { id: 2, text: "Mắt đỏ", value: 1 },
                    { id: 3, text: "Vệ sinh cá nhân kém", value: 1 },
                    { id: 4, text: "Ngủ đủ giấc", value: 0 }
                ],
                correctAnswers: ["Sụt cân", "Mắt đỏ", "Vệ sinh cá nhân kém"]
            },
            {
                id: 11,
                question: "Những thay đổi hành vi nào có thể là dấu hiệu của nghiện ma túy?",
                type: "multiple",
                options: [
                    { id: 1, text: "Hay giữ bí mật", value: 1 },
                    { id: 2, text: "Thay đổi tâm trạng thất thường", value: 1 },
                    { id: 3, text: "Bỏ bê trách nhiệm", value: 1 },
                    { id: 4, text: "Tăng cường giao tiếp xã hội", value: 0 }
                ],
                correctAnswers: [
                    "Hay giữ bí mật",
                    "Thay đổi tâm trạng thất thường",
                    "Bỏ bê trách nhiệm"
                ]
            },
            {
                id: 12,
                question: "Tại sao việc nhận biết sớm nghiện ma túy lại quan trọng?",
                options: [
                    { id: 1, text: "Nhận biết sớm giúp can thiệp và điều trị kịp thời.", value: 1 },
                    { id: 2, text: "Để che giấu hành vi tốt hơn.", value: 0 }
                ],
                correctAnswer: "Nhận biết sớm giúp can thiệp và điều trị kịp thời."
            }
        ]
    },
    {
        id: 5,
        title: "Vai Trò Của Giáo Dục Trong Việc Phòng Chống Ma Túy",
        briefDescription: "Tìm hiểu cách giáo dục đóng vai trò then chốt trong việc ngăn ngừa sử dụng ma túy.",
        content:
            "Giáo dục là công cụ mạnh mẽ trong việc phòng ngừa sử dụng ma túy. Bài học này sẽ khám phá cách các chiến dịch nâng cao nhận thức, chương trình học đường và sáng kiến cộng đồng giúp giảm thiểu tình trạng lạm dụng ma túy.",
        duration: 7,
        videoUrl: "",
        quiz: [
            {
                id: 13,
                question: "Giáo dục giúp phòng chống ma túy như thế nào?",
                options: [
                    { id: 1, text: "Nâng cao nhận thức về rủi ro và hậu quả của ma túy.", value: 1 },
                    { id: 2, text: "Khuyến khích thử ma túy để biết tác hại.", value: 0 }
                ],
                correctAnswer: "Nâng cao nhận thức về rủi ro và hậu quả của ma túy."
            },
            {
                id: 14,
                question: "Một số ví dụ về chương trình phòng chống ma túy hiệu quả là gì?",
                type: "multiple",
                options: [
                    { id: 1, text: "Chiến dịch nâng cao nhận thức cộng đồng", value: 1 },
                    { id: 2, text: "Chương trình giáo dục tại trường học", value: 1 },
                    { id: 3, text: "Hoạt động ngoại khóa phòng chống", value: 1 }
                ],
                correctAnswers: [
                    "Chiến dịch nâng cao nhận thức cộng đồng",
                    "Chương trình giáo dục tại trường học",
                    "Hoạt động ngoại khóa phòng chống"
                ]
            },
            {
                id: 15,
                question: "Tại sao sự tham gia của cộng đồng lại quan trọng trong việc phòng chống ma túy?",
                options: [
                    { id: 1, text: "Tạo ra môi trường hỗ trợ và củng cố nỗ lực phòng chống.", value: 1 },
                    { id: 2, text: "Tăng áp lực tiêu cực lên giới trẻ.", value: 0 }
                ],
                correctAnswer: "Tạo ra môi trường hỗ trợ và củng cố nỗ lực phòng chống."
            }
        ]
    }
];
