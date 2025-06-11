export function passwordReset(fullName: string, resetLink: string): string {
    return `
        <div style="font-family: Arial, sans-serif; color: #222;">
            <h2>Password Reset Request</h2>
            <p>Hi ${fullName},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <p>
                <a href="${resetLink}" style="background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                    Reset Password
                </a>
            </p>
            <p>If you did not request this, you can safely ignore this email.</p>
            <p>Thanks,<br/>The Team</p>
        </div>
    `;
}