export function welcomeTemplate(fullName: string, username: string) {
  return `
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px; min-height: 100vh;">
        <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); overflow: hidden;">
            <!-- Header Section -->
            <div style="background: linear-gradient(135deg, #4f8cff 0%, #3b7bff 100%); padding: 50px 40px; text-align: center;">
                <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;">
                    <div style="font-size: 50px;">💊</div>
                </div>
                <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0 0 12px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    Chào mừng, ${fullName || username}!
                </h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; line-height: 1.5;">
                    Chúng tôi rất vui khi bạn tham gia cộng đồng phòng chống tệ nạn xã hội
                </p>
            </div>
            
            <!-- Content Section -->
            <div style="padding: 50px 40px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="color: #2d3748; font-size: 24px; font-weight: 600; margin: 0 0 20px;">
                        Tài khoản của bạn đã sẵn sàng!
                    </h2>
                    <p style="font-size: 16px; color: #4a5568; margin: 0 0 30px; line-height: 1.6;">
                        Cảm ơn bạn đã đăng ký tham gia hệ thống phòng chống tệ nạn xã hội. 
                        Bây giờ bạn có thể truy cập tất cả các khóa học, tài liệu giáo dục và 
                        tham gia các hoạt động cộng đồng ý nghĩa.
                    </p>
                    
                    <!-- Features List -->
                    <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: left;">
                        <h3 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 20px; text-align: center;">
                            🌟 Những gì bạn có thể làm:
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="background: #4f8cff; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px;">📚</div>
                                <span style="color: #4a5568; font-size: 15px;">Tham gia các khóa học trực tuyến miễn phí</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px;">🏆</div>
                                <span style="color: #4a5568; font-size: 15px;">Hoàn thành bài kiểm tra và nhận chứng chỉ</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="background: #8b5cf6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px;">👥</div>
                                <span style="color: #4a5568; font-size: 15px;">Kết nối với cộng đồng và chia sẻ kinh nghiệm</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="background: #f59e0b; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px;">💬</div>
                                <span style="color: #4a5568; font-size: 15px;">Nhận tư vấn từ các chuyên gia tâm lý</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="http://localhost:5173/login" style="display: inline-block; background: linear-gradient(135deg, #4f8cff 0%, #3b7bff 100%); color: #ffffff; padding: 18px 50px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 18px; box-shadow: 0 8px 25px rgba(79, 140, 255, 0.3); transition: all 0.3s ease; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                        🚀 Bắt đầu hành trình
                    </a>
                </div>
                
                <!-- Support Section -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; padding: 30px; text-align: center; margin-top: 40px;">
                    <h3 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0 0 15px;">
                        🤝 Cần hỗ trợ?
                    </h3>
                    <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0 0 20px; line-height: 1.6;">
                        Đội ngũ hỗ trợ thân thiện của chúng tôi luôn sẵn sàng giúp đỡ bạn!
                    </p>
                    <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                        <a href="mailto:support@drugprevention.vn" style="color: #ffffff; text-decoration: none; font-weight: 500; padding: 10px 20px; background: rgba(255,255,255,0.2); border-radius: 25px; font-size: 15px;">
                            📧 support@drugprevention.vn
                        </a>
                        <a href="http://localhost:5173/help" style="color: #ffffff; text-decoration: none; font-weight: 500; padding: 10px 20px; background: rgba(255,255,255,0.2); border-radius: 25px; font-size: 15px;">
                            🔗 Trung tâm hỗ trợ
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 14px; margin: 0 0 10px; line-height: 1.5;">
                    Cảm ơn bạn đã tin tưởng và đồng hành cùng chúng tôi trong việc xây dựng một cộng đồng khỏe mạnh.
                </p>
                <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                    © 2024 DrugPrevention - Hệ thống phòng chống tệ nạn xã hội
                </p>
            </div>
        </div>
        
        <style>
            @media only screen and (max-width: 650px) {
                div[style*="max-width: 650px"] {
                    margin: 20px !important;
                    border-radius: 15px !important;
                }
                div[style*="padding: 50px 40px"] {
                    padding: 30px 20px !important;
                }
                h1 {
                    font-size: 26px !important;
                }
                h2 {
                    font-size: 20px !important;
                }
                a[style*="padding: 18px 50px"] {
                    padding: 15px 30px !important;
                    font-size: 16px !important;
                }
                div[style*="display: flex"] {
                    flex-direction: column !important;
                    align-items: center !important;
                }
            }
            a:hover {
                background: linear-gradient(135deg, #3b7bff 0%, #2563eb 100%) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 12px 35px rgba(79, 140, 255, 0.4) !important;
            }
        </style>
    </div>
    `;
}