export function welcomeTemplate(fullName: string, username: string) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9f9f9; padding: 48px 0;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 40px;">
            <div style="text-align: center;">
                <img src="https://img.icons8.com/color/96/000000/party-baloons.png" alt="Welcome" style="margin-bottom: 20px;" />
                <h1 style="color: #4f8cff; font-size: 28px; font-weight: 700; margin: 0 0 12px;">Welcome, ${
                  fullName || username
                }!</h1>
                <p style="font-size: 16px; color: #333; margin: 0 0 24px; line-height: 1.5;">
                    We're thrilled to have you join our community! Your account is ready, and a world of exciting features awaits you.
                </p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="http://localhost:5173/login" style="display: inline-block; background: #4f8cff; color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; transition: background 0.3s ease;">
                    Get Started
                </a>
            </div>
            <div style="font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
                <p style="margin: 0 0 16px;">Have questions or need help? Reach out to our friendly support team anytime!</p>
                <p style="margin: 0;">
                    <a href="mailto:support@your-app-url.com" style="color: #4f8cff; text-decoration: none;">support@your-app-url.com</a> | 
                    <a href="https://your-app-url.com/help" style="color: #4f8cff; text-decoration: none;">Help Center</a>
                </p>
            </div>
        </div>
        <style>
            @media only screen and (max-width: 600px) {
                div[style*="max-width: 600px"] {
                    padding: 24px !important;
                }
                h1 {
                    font-size: 24px !important;
                }
                a[style*="padding: 14px 40px"] {
                    padding: 12px 24px !important;
                    font-size: 14px !important;
                }
            }
            a:hover {
                background: #3b7bff !important;
            }
        </style>
    </div>
    `;
}