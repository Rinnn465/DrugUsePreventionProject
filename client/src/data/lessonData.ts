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
        question: [],
    },
    {
        id: 2,
        title: "Tầm Quan Trọng Của Việc Nói Không",
        briefDescription: "Học các chiến lược để chống lại áp lực từ bạn bè và nói không với ma túy.",
        content:
            "Áp lực từ bạn bè là một trong những nguyên nhân chính dẫn đến việc sử dụng ma túy ở giới trẻ. Học cách tự tin nói không là một kỹ năng quan trọng. Bài học này sẽ dạy bạn các kỹ thuật để xử lý áp lực từ bạn bè, xây dựng sự tự tin và đưa ra những lựa chọn lành mạnh.",
        duration: 8,
        videoUrl: "",
        question: [],
    },
    {
        id: 3,
        title: "Những Hoạt Động Lành Mạnh Thay Thế Việc Sử Dụng Ma Túy",
        briefDescription: "Khám phá các hoạt động và thói quen tích cực giúp xây dựng lối sống không ma túy.",
        content:
            "Tham gia vào các hoạt động lành mạnh như thể thao, sở thích cá nhân và tình nguyện có thể làm giảm khả năng sử dụng ma túy. Bài học này sẽ bàn về lợi ích của việc giữ cho bản thân năng động, xây dựng các mối quan hệ hỗ trợ và đặt mục tiêu cá nhân.",
        duration: 9,
        videoUrl: "",
        question: [
            {
                id: 1,
                lessonId: 3,
                questionText: "Hoạt động nào sau đây được coi là lành mạnh và tích cực?",
                type: "multiple",
                answers: [
                    {
                        id: 1,
                        questionId: 1,
                        answerText: "Chơi thể thao",
                        isCorrect: true,
                    },
                    {
                        id: 2,
                        questionId: 1,
                        answerText: "Xem TV suốt ngày",
                        isCorrect: false,
                    },
                    {
                        id: 3,
                        questionId: 1,
                        answerText: "Ngủ muộn và dậy trễ",
                        isCorrect: false,
                    },
                    {
                        id: 4,
                        questionId: 1,
                        answerText: "Tham gia vào các hoạt động tình nguyện",
                        isCorrect: true,
                    },
                ],
            },
        ],
    },
    {
        id: 4,
        title: "Nhận Biết Dấu Hiệu Của Nghiện Ma Túy",
        briefDescription: "Học cách nhận biết các dấu hiệu cảnh báo của nghiện ma túy ở bản thân hoặc người khác.",
        content:
            "Việc nhận biết sớm các dấu hiệu của nghiện ma túy có thể giúp ngăn chặn những hậu quả nghiêm trọng hơn. Bài học này sẽ đề cập đến các biểu hiện về thể chất, cảm xúc và hành vi của nghiện, cũng như các bước để tìm kiếm sự giúp đỡ.",
        duration: 10,
        videoUrl: "",
        question: [],
    },
    {
        id: 5,
        title: "Vai Trò Của Giáo Dục Trong Việc Phòng Chống Ma Túy",
        briefDescription: "Tìm hiểu cách giáo dục đóng vai trò then chốt trong việc ngăn ngừa sử dụng ma túy.",
        content:
            "Giáo dục là công cụ mạnh mẽ trong việc phòng ngừa sử dụng ma túy. Bài học này sẽ khám phá cách các chiến dịch nâng cao nhận thức, chương trình học đường và sáng kiến cộng đồng giúp giảm thiểu tình trạng lạm dụng ma túy.",
        duration: 7,
        videoUrl: "",
        question: [],
    }
];
