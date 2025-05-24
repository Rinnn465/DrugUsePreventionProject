import { Event } from "../types/Events";

export const eventData: Event[] = [
    {
        id: 1,
        name: "Hội Thảo Nhận Thức Về Ma Túy Cho Thanh Thiếu Niên",
        date: new Date("2023-11-20"),
        location: "Los Angeles, CA",
        description: "Một hội thảo tương tác nhằm giáo dục thanh thiếu niên về tác hại của việc lạm dụng ma túy.",
        organizer: "Tổ chức YouthCare Foundation",
        attendees: 300,
        tags: ["Nhận Thức", "Thanh Thiếu Niên", "Hội Thảo"],
        type: 'offline',
        url: "https://youthdrugawareness.com"
    },
    {
        id: 2,
        name: "Hội Chợ Phòng Chống Ma Túy Cộng Đồng",
        date: new Date("2024-01-15"),
        location: "Austin, TX",
        description: "Một sự kiện cộng đồng với tài nguyên và hoạt động thúc đẩy việc phòng chống ma túy.",
        organizer: "Sáng Kiến Cộng Đồng An Toàn",
        attendees: 500,
        tags: ["Cộng Đồng", "Phòng Chống", "Hội Chợ"],
        type: 'offline',
        url: "https://drugpreventionfair.com"
    },
    {
        id: 3,
        name: "Hội Thảo Trực Tuyến: Phá Vỡ Vòng Lặp Nghiện Ngập",
        date: new Date("2025-12-10"),
        location: "Trực tuyến",
        description: "Một hội thảo trực tuyến thảo luận về các chiến lược để phá vỡ vòng lặp nghiện ngập.",
        organizer: "Liên Minh Phục Hồi",
        tags: ["Hội Thảo", "Nghiện Ngập", "Trực Tuyến"],
        type: 'online',
        url: "https://breakingthecycle.com"
    },
    {
        id: 4,
        name: "Hội Nghị Phụ Huynh Chống Ma Túy",
        date: new Date("2024-03-05"),
        location: "Chicago, IL",
        description: "Một hội nghị dành cho phụ huynh để tìm hiểu về các chiến lược phòng chống ma túy cho gia đình.",
        organizer: "Phụ Huynh Đoàn Kết",
        attendees: 400,
        tags: ["Phụ Huynh", "Hội Nghị", "Phòng Chống"],
        type: 'offline',
        // url: "https://parentsagainstdrugs.com"
    },
    {
        id: 5,
        name: "Chia Sẻ Hành Trình Phục Hồi: Buổi Tọa Đàm Trực Tuyến",
        date: new Date("2024-02-20"),
        location: "Trực tuyến",
        description: "Lắng nghe những câu chuyện phục hồi đầy cảm hứng từ những người từng vượt qua cơn nghiện.",
        organizer: "Mạng Lưới Hy Vọng & Chữa Lành",
        tags: ["Phục Hồi", "Tọa Đàm", "Trực Tuyến"],
        type: 'online',
        url: "https://recoverystoriespanel.com"
    }
];
