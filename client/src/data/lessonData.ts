import { Lesson } from "../types/Lesson";

export const lessonData: Lesson[] = [
    {
        id: 1,
        title: "Hiểu Về Lạm Dụng Ma Túy",
        briefDescription:
            "Giới thiệu về những nguy hiểm của việc lạm dụng ma túy và tác động của nó đến cá nhân và xã hội.",
        content:
            "Lạm dụng ma túy là hành vi sử dụng thường xuyên các chất gây nghiện hoặc bất hợp pháp như heroin, cocaine, cần sa hoặc thuốc kê đơn mà không có chỉ định y tế. Hành vi này có thể gây ra các hậu quả nghiêm trọng về sức khỏe thể chất và tinh thần, dẫn đến các bệnh mãn tính, rối loạn tâm thần, và thậm chí là tử vong. Không chỉ ảnh hưởng đến cá nhân, lạm dụng ma túy còn tác động xấu đến gia đình, bạn bè và cộng đồng, làm gia tăng tội phạm, tai nạn và gánh nặng y tế. Hiểu rõ về các loại ma túy, cách chúng hoạt động trong cơ thể và những hậu quả ngắn hạn và dài hạn mà chúng gây ra là bước đầu tiên trong việc phòng ngừa hiệu quả. Bài học này sẽ cung cấp thông tin chi tiết về các loại ma túy thường bị lạm dụng, tác động sinh lý và tâm lý của chúng, cũng như cách nhận biết các dấu hiệu cảnh báo khi một người có thể đang sử dụng hoặc nghiện ma túy. Từ đó, chúng ta có thể đưa ra các lựa chọn đúng đắn để bảo vệ bản thân và những người xung quanh.",
        duration: 10,
        videoUrl: "",
        question: [],
    },
    {
        id: 2,
        title: "Tầm Quan Trọng Của Việc Nói Không",
        briefDescription: "Học các chiến lược để chống lại áp lực từ bạn bè và nói không với ma túy.",
        content:
            "Khi đối mặt với áp lực từ bạn bè hoặc môi trường xung quanh, nhiều người – đặc biệt là thanh thiếu niên – cảm thấy khó khăn trong việc từ chối sử dụng ma túy. Việc học cách nói không một cách dứt khoát và tự tin là một kỹ năng thiết yếu trong việc phòng tránh rủi ro liên quan đến ma túy. Bài học này sẽ giúp bạn hiểu rõ về bản chất của áp lực từ bạn bè, cách nhận diện các tình huống nguy hiểm và cung cấp những chiến lược thực tế để đối phó hiệu quả. Bạn sẽ học được cách sử dụng ngôn ngữ cơ thể, giọng nói và lý do hợp lý để từ chối, cũng như cách xây dựng lòng tự trọng và giá trị cá nhân. Ngoài ra, việc thiết lập những mối quan hệ lành mạnh, tích cực và tham gia vào các hoạt động xây dựng sẽ giúp bạn tạo ra một môi trường sống an toàn và hỗ trợ. Nói không với ma túy không chỉ là hành động cá nhân, mà còn là bước quan trọng trong việc giữ gìn sức khỏe, tương lai và đóng góp tích cực cho xã hội.",
        duration: 8,
        videoUrl: "",
        question: [],
    },
    {
        id: 3,
        title: "Những Hoạt Động Lành Mạnh Thay Thế Việc Sử Dụng Ma Túy",
        briefDescription: "Khám phá các hoạt động và thói quen tích cực giúp xây dựng lối sống không ma túy.",
        content:
            "Việc tìm kiếm những hoạt động tích cực và lành mạnh để thay thế cho việc sử dụng ma túy là một chiến lược hiệu quả trong phòng chống nghiện ngập. Khi con người có những mục tiêu, đam mê và niềm vui trong cuộc sống, họ sẽ ít bị cám dỗ bởi các chất gây nghiện. Bài học này sẽ giới thiệu nhiều lựa chọn lành mạnh như chơi thể thao, rèn luyện thể chất, tham gia các câu lạc bộ sở thích, học kỹ năng mới hoặc tham gia các hoạt động tình nguyện trong cộng đồng. Những hoạt động này không chỉ giúp giảm căng thẳng, cải thiện sức khỏe tinh thần mà còn tạo điều kiện để bạn xây dựng các mối quan hệ tích cực và môi trường sống hỗ trợ. Ngoài ra, việc duy trì thói quen sống điều độ, có kỷ luật như ngủ đúng giờ, ăn uống lành mạnh và luyện tập thể dục đều đặn cũng đóng vai trò quan trọng trong việc giữ cho tinh thần và thể chất luôn khỏe mạnh. Từ đó, bạn sẽ thấy rằng cuộc sống không cần đến ma túy vẫn có thể đầy đủ, thú vị và đáng sống.",
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
            "Nghiện ma túy thường không xảy ra một cách đột ngột mà là kết quả của một quá trình sử dụng kéo dài. Việc nhận biết các dấu hiệu sớm của nghiện là điều quan trọng để can thiệp kịp thời và giảm thiểu hậu quả. Bài học này sẽ giúp bạn nhận diện các biểu hiện thể chất như sụt cân nhanh, thay đổi ngoại hình, mắt đỏ hoặc mệt mỏi thường xuyên. Về mặt cảm xúc, người nghiện thường dễ cáu gắt, lo âu, trầm cảm hoặc thay đổi tâm trạng thất thường. Hành vi của họ cũng có thể thay đổi như trốn học, bỏ việc, xa lánh bạn bè, thường xuyên nói dối hoặc có các hành động bất thường. Ngoài ra, dấu hiệu nghiện còn thể hiện ở việc lệ thuộc vào chất gây nghiện để cảm thấy “bình thường”, tăng liều dùng theo thời gian và không thể kiểm soát hành vi sử dụng. Hiểu được những tín hiệu này là bước đầu để bạn hoặc người thân tìm kiếm sự hỗ trợ từ chuyên gia hoặc trung tâm cai nghiện. Việc can thiệp sớm có thể giúp cứu lấy cuộc đời của một người trước khi tình trạng trở nên nghiêm trọng hơn.",
        duration: 10,
        videoUrl: "",
        question: [],
    },
    {
        id: 5,
        title: "Vai Trò Của Giáo Dục Trong Việc Phòng Chống Ma Túy",
        briefDescription: "Tìm hiểu cách giáo dục đóng vai trò then chốt trong việc ngăn ngừa sử dụng ma túy.",
        content:
            "Giáo dục là một trong những công cụ mạnh mẽ nhất trong công cuộc phòng chống ma túy. Khi mọi người, đặc biệt là thanh thiếu niên, được trang bị kiến thức đầy đủ về ma túy và hậu quả của việc sử dụng, họ sẽ có khả năng đưa ra quyết định sáng suốt hơn. Bài học này sẽ phân tích vai trò của các chương trình giáo dục trong trường học, các chiến dịch nâng cao nhận thức trong cộng đồng và sự tham gia của phụ huynh, giáo viên và chuyên gia tư vấn trong việc định hướng hành vi lành mạnh. Giáo dục không chỉ đơn thuần là truyền đạt thông tin mà còn là quá trình tạo ra tư duy phản biện, kỹ năng giao tiếp và khả năng đối phó với áp lực xã hội. Khi cá nhân được khuyến khích đặt câu hỏi, thảo luận và tham gia vào các hoạt động tương tác, họ sẽ phát triển sự tự tin và trách nhiệm đối với cuộc sống của chính mình. Cuối cùng, giáo dục đóng vai trò như một nền tảng vững chắc để xây dựng cộng đồng khỏe mạnh, nơi mà các giá trị tích cực được tôn trọng và củng cố qua từng thế hệ.",
        duration: 7,
        videoUrl: "",
        question: [],
    }
];
