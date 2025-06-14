import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

/**
 * Interface for email configuration options
 */
interface MailOptions {
    from: string;     // Sender email address
    to: string;       // Recipient email address
    subject: string;  // Email subject line
    html: string;     // HTML content of the email
}

/**
 * Sends an email using Gmail SMTP
 * 
 * @route Utility function - not an endpoint
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML content of the email
 * @returns {Promise<any>} Nodemailer info object containing send status
 * @throws {Error} If email sending fails
 * 
 * @example
 * try {
 *   await sendEmail(
 *     'user@example.com',
 *     'Welcome!',
 *     '<h1>Welcome to our platform</h1>'
 *   );
 * } catch (error) {
 *   console.error('Failed to send email:', error);
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
