export function passwordReset(fullName: string, resetLink: string): string {
    return `
        <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 60px 20px; min-height: 100vh;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); overflow: hidden;">
                <!-- Header Section -->
                <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 50px 40px; text-align: center;">
                    <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;">
                        <div style="font-size: 50px;">🔒</div>
                    </div>
                    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 12px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        Yêu cầu đặt lại mật khẩu
                    </h1>
                    <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; line-height: 1.5;">
                        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn
                    </p>
                </div>
                
                <!-- Content Section -->
                <div style="padding: 50px 40px;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h2 style="color: #2d3748; font-size: 22px; font-weight: 600; margin: 0 0 20px;">
                            Xin chào ${fullName}! 👋
                        </h2>
                        <p style="font-size: 16px; color: #4a5568; margin: 0 0 30px; line-height: 1.6;">
                            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                            Để tiếp tục, vui lòng nhấp vào nút bên dưới để thiết lập mật khẩu mới.
                        </p>
                        
                        <!-- Security Notice -->
                        <div style="background: #fff5f5; border: 2px solid #fed7d7; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: left;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                                <div style="background: #ff6b6b; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px;">⚠️</div>
                                <h3 style="color: #c53030; font-size: 18px; font-weight: 600; margin: 0;">
                                    Lưu ý bảo mật
                                </h3>
                            </div>
                            <p style="color: #742a2a; font-size: 15px; margin: 0 0 10px; line-height: 1.5;">
                                • Link này chỉ có hiệu lực trong <strong>15 phút</strong> kể từ khi gửi
                            </p>
                            <p style="color: #742a2a; font-size: 15px; margin: 0 0 10px; line-height: 1.5;">
                                • Chỉ sử dụng được <strong>một lần duy nhất</strong>
                            </p>
                            <p style="color: #742a2a; font-size: 15px; margin: 0; line-height: 1.5;">
                                • Không chia sẻ link này với bất kỳ ai khác
                            </p>
                        </div>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: #ffffff; padding: 18px 50px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 18px; box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3); transition: all 0.3s ease; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                            🔑 Đặt lại mật khẩu
                        </a>
                    </div>
                    
                    <!-- Alternative Option -->
                    <div style="background: #f7fafc; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                        <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;">
                            Không thể nhấp vào nút?
                        </h3>
                        <p style="color: #4a5568; font-size: 14px; margin: 0 0 15px; line-height: 1.5;">
                            Sao chép và dán link sau vào trình duyệt:
                        </p>
                        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; font-family: monospace; font-size: 12px; color: #2d3748; word-break: break-all;">
                            ${resetLink}
                        </div>
                    </div>
                    
                    <!-- Not You Section -->
                    <div style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); border-radius: 15px; padding: 30px; text-align: center; margin-top: 40px;">
                        <h3 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 15px;">
                            🤔 Không phải bạn yêu cầu?
                        </h3>
                        <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin: 0 0 20px; line-height: 1.6;">
                            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. 
                            Tài khoản của bạn vẫn an toàn và mật khẩu không thay đổi.
                        </p>
                        <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 15px; margin-top: 15px;">
                            <p style="color: #ffffff; font-size: 14px; margin: 0; font-weight: 500;">
                                💡 Khuyến nghị: Thay đổi mật khẩu định kỳ để bảo mật tài khoản
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 14px; margin: 0 0 10px; line-height: 1.5;">
                        Cảm ơn bạn đã sử dụng hệ thống DrugPrevention. Chúng tôi luôn đặt bảo mật của bạn lên hàng đầu.
                    </p>
                    <p style="color: #a0aec0; font-size: 12px; margin: 0 0 15px;">
                        © 2024 DrugPrevention - Hệ thống phòng chống tệ nạn xã hội
                    </p>
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 15px;">
                        <a href="mailto:support@drugprevention.vn" style="color: #4299e1; text-decoration: none; font-size: 13px; margin: 0 10px;">
                            📧 Liên hệ hỗ trợ
                        </a>
                        <span style="color: #cbd5e0;">|</span>
                        <a href="http://localhost:5173/help" style="color: #4299e1; text-decoration: none; font-size: 13px; margin: 0 10px;">
                            🔗 Trung tâm trợ giúp
                        </a>
                    </div>
                </div>
            </div>
            
            <style>
                @media only screen and (max-width: 600px) {
                    div[style*="max-width: 600px"] {
                        margin: 20px !important;
                        border-radius: 15px !important;
                    }
                    div[style*="padding: 50px 40px"] {
                        padding: 30px 20px !important;
                    }
                    h1 {
                        font-size: 24px !important;
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
                    background: linear-gradient(135deg, #ee5a52 0%, #e53e3e 100%) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4) !important;
                }
            </style>
        </div>
    `;
}