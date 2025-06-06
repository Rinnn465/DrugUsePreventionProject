export function welcomeTemplate(fullName: string, username: string) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 40px 0;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 32px;">
        <div style="text-align: center;">
            <img src="https://img.icons8.com/color/96/000000/party-baloons.png" alt="Welcome" style="margin-bottom: 16px;" />
            <h1 style="color: #4f8cff; margin-bottom: 8px;">Welcome, ${
              fullName || username
            }!</h1>
        </div>
        <p style="font-size: 16px; color: #333; margin-bottom: 24px;">
            We're excited to have you join our community. Your account has been created successfully.<br>
            Start exploring all the features we offer!
        </p>
        <div style="text-align: center;">
            <a href="https://your-app-url.com/login" style="display: inline-block; background: #4f8cff; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Get Started
            </a>
        </div>
        <p style="font-size: 13px; color: #888; margin-top: 32px; text-align: center;">
            If you have any questions, just reply to this email—we're always happy to help!
        </p>
        </div>
    </div>
    `;
}
