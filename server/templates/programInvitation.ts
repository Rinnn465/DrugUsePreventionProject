/**
 * Template cho email lời mời tham gia chương trình cộng đồng
 * Sử dụng để gửi lời mời Zoom meeting cho người tham gia đã đăng ký
 */

interface ProgramInvitationData {
    recipientName: string;
    programName: string;
    programDate: string;
    programTime: string;
    zoomLink: string;
    zoomMeetingId: string;
    zoomPasscode: string;
    organizerName: string;
}

export const programInvitationTemplate = (data: ProgramInvitationData): string => {
    const {
        recipientName,
        programName,
        programDate,
        programTime,
        zoomLink,
        zoomMeetingId,
        zoomPasscode,
        organizerName
    } = data;
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lời mời tham gia chương trình</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    🎯 Lời mời tham gia chương trình
                </h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                    Phòng chống tệ nạn xã hội
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
                
                <!-- Greeting -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
                        Xin chào ${recipientName}! 👋
                    </h2>
                    <p style="color: #4a5568; line-height: 1.6; margin: 0; font-size: 16px;">
                        Chúng tôi vui mừng thông báo rằng chương trình <strong>"${programName}"</strong> mà bạn đã đăng ký sẽ diễn ra sớm!
                    </p>
                </div>

                <!-- Program Info -->
                <div style="background-color: #f7fafc; border-radius: 10px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #667eea;">
                    <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                        📅 Thông tin chương trình
                    </h3>
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; align-items: center;">
                            <span style="color: #667eea; font-weight: 600; min-width: 120px; font-size: 14px;">🎯 Chương trình:</span>
                            <span style="color: #2d3748; font-size: 16px; font-weight: 500;">${programName}</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <span style="color: #667eea; font-weight: 600; min-width: 120px; font-size: 14px;">📅 Ngày:</span>
                            <span style="color: #2d3748; font-size: 16px;">${programDate}</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <span style="color: #667eea; font-weight: 600; min-width: 120px; font-size: 14px;">⏰ Giờ:</span>
                            <span style="color: #2d3748; font-size: 16px;">${programTime}</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <span style="color: #667eea; font-weight: 600; min-width: 120px; font-size: 14px;">👨‍💼 Tổ chức:</span>
                            <span style="color: #2d3748; font-size: 16px;">${organizerName}</span>
                        </div>
                    </div>
                </div>

                <!-- Zoom Meeting Info -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 25px; margin-bottom: 30px; color: white;">
                    <h3 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                        💻 Thông tin tham gia Zoom
                    </h3>
                    <div style="background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">ID cuộc họp:</p>
                        <p style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: 1px;">${zoomMeetingId}</p>
                    </div>
                    ${zoomPasscode !== 'Không yêu cầu mật khẩu' ? `
                    <div style="background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Mật khẩu:</p>
                        <p style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: 1px;">${zoomPasscode}</p>
                    </div>
                    ` : `
                    <div style="background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 16px; opacity: 0.9;">✅ Không yêu cầu mật khẩu - chỉ cần click vào nút bên dưới để tham gia</p>
                    </div>
                    `}
                    
                    <!-- Join Button -->
                    <div style="text-align: center; margin-top: 25px;">
                        <a href="${zoomLink}" 
                           style="display: inline-block; background-color: #ffffff; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                            🚀 Tham gia ngay
                        </a>
                    </div>
                </div>

                <!-- Instructions -->
                <div style="background-color: #fff5f5; border-radius: 10px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #f56565;">
                    <h3 style="color: #c53030; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        ⚠️ Lưu ý quan trọng
                    </h3>
                    <ul style="color: #742a2a; line-height: 1.6; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Vui lòng tham gia đúng giờ để không bỏ lỡ nội dung quan trọng</li>
                        <li style="margin-bottom: 8px;">Đảm bảo kết nối internet ổn định và thiết bị có micro/camera</li>
                        <li style="margin-bottom: 8px;">Nếu gặp vấn đề kỹ thuật, vui lòng liên hệ với chúng tôi ngay</li>
                        <li>Chuẩn bị tinh thần tích cực và sẵn sàng tham gia thảo luận</li>
                    </ul>
                </div>

                <!-- Support Info -->
                <div style="text-align: center; padding: 25px; background-color: #f8fafc; border-radius: 10px; margin-bottom: 30px;">
                    <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        💬 Cần hỗ trợ?
                    </h3>
                    <p style="color: #4a5568; margin: 0 0 15px 0; line-height: 1.6;">
                        Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi:
                    </p>
                    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                        📧 <a href="mailto:support@drugprevention.vn" style="color: #667eea; text-decoration: none; font-weight: 500;">support@drugprevention.vn</a> |
                        📞 <span style="color: #4a5568; font-weight: 500;">1900-123-456</span>
                    </div>
                </div>

                <!-- Closing -->
                <div style="text-align: center; padding: 20px 0;">
                    <p style="color: #4a5568; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                        Chúng tôi rất mong được gặp bạn trong chương trình này! 🌟
                    </p>
                    <p style="color: #718096; margin: 0; font-size: 14px; font-style: italic;">
                        Trân trọng,<br>
                        Đội ngũ Phòng chống tệ nạn xã hội
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #2d3748; padding: 25px 30px; text-align: center;">
                <p style="color: #a0aec0; margin: 0; font-size: 13px; line-height: 1.5;">
                    Đây là email tự động. Vui lòng không trả lời email này.<br>
                    © 2024 Hệ thống Phòng chống tệ nạn xã hội. Tất cả quyền được bảo lưu.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};
