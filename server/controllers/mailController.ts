import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { MailOptions } from "../types/type"; // Import MailOptions type for email structure
dotenv.config();



/**
 * Gửi email sử dụng Gmail SMTP
 * 
 * @route Hàm tiện ích - không phải endpoint
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} html - Nội dung email dạng HTML
 * @returns {Promise<any>} Đối tượng info của Nodemailer chứa trạng thái gửi
 * @throws {Error} Nếu gửi email thất bại
 * 
 * @example
 * try {
 *   await sendEmail(
 *     'user@example.com',
 *     'Chào mừng!',
 *     '<h1>Chào mừng bạn đến với nền tảng của chúng tôi</h1>'
 *   );
 * } catch (error) {
 *   console.error('Gửi email thất bại:', error);
 * }
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
    // Create reusable transporter object using Gmail SMTP
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Gmail address from env
            pass: process.env.EMAIL_PASS,  // App-specific password from env
        },
    });

    // Setup email data with unicode symbols
    const mailOptions: MailOptions = {
        from: process.env.EMAIL_USER as string, // Sender address
        to,        // List of receivers
        subject,   // Subject line
        html,      // HTML body content
    };

    try {
        // Send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Re-throw to handle in calling function
    }
};
