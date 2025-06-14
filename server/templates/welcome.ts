export function welcomeTemplate(fullName: string, username: string) {
  return `
    <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header Section -->
            <div style="background: linear-gradient(135deg, #4f8cff 0%, #3b7bff 100%); padding: 40px 30px; text-align: center;">
                <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 70px; height: 70px; margin: 0 auto 20px; position: relative;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 35px;">💊</div>
                </div>
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px;">
                    Chào mừng ${fullName || username}!
                </h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">
                    Cảm ơn bạn đã tham gia cộng đồng phòng chống tệ nạn xã hội
                </p>
            </div>
            
            <!-- Content Section -->
            <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 style="color: #2d3748; font-size: 18px; font-weight: 600; margin: 0 0 15px;">
                        Tài khoản đã sẵn sàng! 🎉
                    </h2>
                    <p style="font-size: 14px; color: #4a5568; margin: 0 0 20px; line-height: 1.5;">
                        Bạn có thể bắt đầu truy cập các khóa học, tài liệu giáo dục và tham gia hoạt động cộng đồng.
                    </p>
                </div>
                
                <!-- Features Beautiful Horizontal Layout -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0; padding: 0 8px 0 40px;">
                    <div style="text-align: center; padding: 12px 6px; background: #f8fafc; border-radius: 8px; width: 80px;">
                        <div style="font-size: 22px; margin-bottom: 6px;">📚</div>
                        <span style="color: #4a5568; font-size: 11px; font-weight: 500;">Khóa học</span>
                    </div>
                    <div style="text-align: center; padding: 12px 6px; background: #f8fafc; border-radius: 8px; width: 80px;">
                        <div style="font-size: 22px; margin-bottom: 6px;">🏆</div>
                        <span style="color: #4a5568; font-size: 11px; font-weight: 500;">Chứng chỉ</span>
                    </div>
                    <div style="text-align: center; padding: 12px 6px; background: #f8fafc; border-radius: 8px; width: 80px;">
                        <div style="font-size: 22px; margin-bottom: 6px;">👥</div>
                        <span style="color: #4a5568; font-size: 11px; font-weight: 500;">Cộng đồng</span>
                    </div>
                    <div style="text-align: center; padding: 12px 6px; background: #f8fafc; border-radius: 8px; width: 80px;">
                        <div style="font-size: 22px; margin-bottom: 6px;">💬</div>
                        <span style="color: #4a5568; font-size: 11px; font-weight: 500;">Tư vấn</span>
                    </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 25px 0;">
                    <a href="http://localhost:5173/login" style="display: inline-block; background: linear-gradient(135deg, #4f8cff 0%, #3b7bff 100%); color: #ffffff; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(79, 140, 255, 0.3);">
                        🚀 Bắt đầu ngay
                    </a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 12px; margin: 0 0 8px;">
                    Cảm ơn bạn đã đồng hành cùng chúng tôi
                </p>
                <p style="color: #a0aec0; font-size: 11px; margin: 0 0 12px;">
                    © 2024 DrugPrevention - Hệ thống phòng chống tệ nạn xã hội
                </p>
                <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                    <a href="mailto:support@drugprevention.vn" style="color: #4299e1; text-decoration: none; font-size: 11px;">
                        📧 Hỗ trợ
                    </a>
                    <a href="http://localhost:5173/help" style="color: #4299e1; text-decoration: none; font-size: 11px;">
                        🔗 Trợ giúp
                    </a>
                </div>
            </div>
        </div>
        
        <style>
            @media only screen and (max-width: 500px) {
                div[style*="max-width: 500px"] {
                    margin: 10px !important;
                    border-radius: 12px !important;
                }
                div[style*="padding: 40px 30px"] {
                    padding: 25px 20px !important;
                }
                div[style*="padding: 30px"] {
                    padding: 20px !important;
                }
                h1 {
                    font-size: 20px !important;
                }
                div[style*="justify-content: space-between"] {
                    flex-direction: column !important;
                    gap: 12px !important;
                    padding: 0 20px !important;
                }
                div[style*="width: 80px"] {
                    width: auto !important;
                    padding: 15px !important;
                }
                div[style*="display: flex; justify-content: center"] {
                    flex-direction: column !important;
                    gap: 8px !important;
                }
            }
        </style>
    </div>
    `;
}