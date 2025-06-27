import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { MailOptions } from "../types/type"; // Adjust path as necessary

dotenv.config();


/**
 * Sends an email using Gmail SMTP with SSL certificate error handling
 * 
 * @route Utility function - not an endpoint
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML content of the email
 * @returns {Promise<any>} Nodemailer info object containing send status
 * @throws {Error} If email sending fails
 * 
 * Features:
 * - Handles self-signed certificate errors in development
 * - Includes connection verification before sending
 * - Provides detailed error logging for debugging
 * - Uses secure timeouts to prevent hanging connections
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
        tls: {
            // Ignore self-signed certificate errors in development
            rejectUnauthorized: false
        },
        // Alternative configuration for development environments
        secure: false, // Use false for port 587, true for 465
        port: 587,
        // Add timeout to prevent hanging connections
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000,    // 30 seconds
        socketTimeout: 60000       // 60 seconds
    });

    // Setup email data with unicode symbols
    const mailOptions: MailOptions = {
        from: process.env.EMAIL_USER as string, // Sender address
        to,        // List of receivers
        subject,   // Subject line
        html,      // HTML body content
    };

    try {
        // Verify transporter configuration before sending
        await transporter.verify();
        console.log("SMTP server connection verified successfully");

        // Send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        
        // Provide more specific error information
        if (error instanceof Error) {
            if (error.message.includes('self signed certificate') || 
                error.message.includes('certificate chain')) {
                console.error("SSL Certificate Error - TLS settings have been configured to ignore self-signed certificates");
            }
            if (error.message.includes('authentication failed')) {
                console.error("Authentication Error - Check EMAIL_USER and EMAIL_PASS environment variables");
            }
            if (error.message.includes('timeout')) {
                console.error("Timeout Error - Check network connection and SMTP server availability");
            }
        }
        
        throw error; // Re-throw to handle in calling function
    }
};

// Alternative transporter configurations for different scenarios:

/* 
// Option 1: Direct SMTP configuration (if service: "gmail" doesn't work)
const transporter = nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    }
});

// Option 2: For production environment with proper certificates
const transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: true, // Set to true in production
        minVersion: 'TLSv1.2'
    }
});

// Option 3: Using OAuth2 (most secure, but more complex setup)
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: process.env.GMAIL_ACCESS_TOKEN,
    },
    tls: {
        rejectUnauthorized: false
    }
});
*/


