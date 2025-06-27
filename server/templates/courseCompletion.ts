export function courseCompletionTemplate(fullName: string, courseName: string, completionDate: string) {
    return `
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: #f0f9ff; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header Section -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; position: relative;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px;">🏆</div>
                </div>
                <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">
                    Chúc mừng ${fullName}!
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0;">
                    Bạn đã hoàn thành xuất sắc khóa học
                </p>
            </div>
            
            <!-- Content Section -->
            <div style="padding: 35px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <h2 style="color: #059669; font-size: 20px; font-weight: 600; margin: 0 0 8px;">
                            "${courseName}"
                        </h2>
                        <p style="color: #16a34a; font-size: 14px; margin: 0;">
                            Hoàn thành vào ngày ${completionDate}
                        </p>
                    </div>
                    
                    <p style="font-size: 15px; color: #374151; margin: 0 0 25px; line-height: 1.6;">
                        Xin chúc mừng! Bạn đã thể hiện sự kiên trì và nỗ lực đáng ngưỡng mộ. 
                        Kiến thức bạn học được sẽ giúp ích rất nhiều trong cuộc sống và công việc.
                    </p>
                </div>
                
                <!-- Achievement Features -->
                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0;">
                    <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-align: center;">
                        🎖️ Thành tựu đạt được
                    </h3>
                    <div style="display: flex; justify-content: space-around; align-items: center; margin: 15px 0;">
                        <div style="text-align: center; padding: 15px 10px;">
                            <div style="font-size: 24px; margin-bottom: 8px;">📚</div>
                            <span style="color: #4b5563; font-size: 12px; font-weight: 500;">Kiến thức<br>mới</span>
                        </div>
                        <div style="text-align: center; padding: 15px 10px;">
                            <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
                            <span style="color: #4b5563; font-size: 12px; font-weight: 500;">Hoàn thành<br>100%</span>
                        </div>
                        <div style="text-align: center; padding: 15px 10px;">
                            <div style="font-size: 24px; margin-bottom: 8px;">🌟</div>
                            <span style="color: #4b5563; font-size: 12px; font-weight: 500;">Kỹ năng<br>nâng cao</span>
                        </div>
                        <div style="text-align: center; padding: 15px 10px;">
                            <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
                            <span style="color: #4b5563; font-size: 12px; font-weight: 500;">Mục tiêu<br>đạt được</span>
                        </div>
                    </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5173/courses" 
                       style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                        🎓 Khám phá khóa học khác
                    </a>
                </div>
                
                <!-- Next Steps -->
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <h3 style="color: #92400e; font-size: 15px; font-weight: 600; margin: 0 0 10px;">
                        💡 Gợi ý cho bạn:
                    </h3>
                    <ul style="color: #78350f; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.5;">
                        <li style="margin-bottom: 8px;">Áp dụng kiến thức vào thực tế hàng ngày</li>
                        <li style="margin-bottom: 8px;">Chia sẻ với bạn bè và gia đình</li>
                        <li style="margin-bottom: 8px;">Tham gia các hoạt động cộng đồng</li>
                        <li>Tiếp tục học các khóa học khác để nâng cao kiến thức</li>
                    </ul>
                </div>
                
                <!-- Support Section -->
                <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px;">
                        Cần hỗ trợ? Liên hệ với chúng tôi:
                    </p>
                    <p style="color: #4b5563; font-size: 14px; margin: 0;">
                        📧 <a href="mailto:support@drugprevention.com" style="color: #10b981; text-decoration: none;">support@drugprevention.com</a> |
                        📞 <span style="color: #10b981;">1900-xxxx</span>
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px; line-height: 1.4;">
                    Đây là email tự động. Vui lòng không trả lời email này.
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    © 2025 Hệ thống Phòng chống Tệ nạn Xã hội. Bảo lưu mọi quyền.
                </p>
            </div>
        </div>
    </div>
  `;
}
