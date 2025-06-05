const Account = require('../models/account');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Use to register a new user
exports.register = async (req, res) => {
    const { username, email, password, fullName, dateOfBirth } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const userId = await Account.create(username, email, hashedPassword, fullName, dateOfBirth);
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
};

// Use to login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Account.findByEmail(email);
        if (user && await bcrypt.compare(password, user.Password)) {
            req.session.user = user;
            res.status(201).json({ message: 'Login successful', user: user });
        } else {
            res.status(401).json({ message: 'Wrong email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
};

// Use to logout a user
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out' });
    });
};

// Use to handle forgot password functionality
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Account.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiryMinutes = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 15; // Default to 15 minutes if not set
        const resetTokenExpiry = new Date(Date.now() + resetTokenExpiryMinutes + 15 * 60 * 1000); // 15 minutes from now
        
        // Save token to database
        await Account.saveResetToken(user.AccountID, resetToken, resetTokenExpiry);

        // Send email
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #555;">You requested a password reset. Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold;">Reset Password</a>
            <p style="color: #555;">This link will expire in 1 hour.</p>
            <p style="color: #555;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">&copy; 2025 Drug Use Prevention. All rights reserved.</p>
        </div>
    `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset email sent successfully' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending reset email' });
    }
};

// Reset Password - Verify token and update password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

   try {
        // Find user by reset token
        const user = await Account.findByResetToken(token);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Check if token is expired (already handled in findByResetToken)
        if (new Date() > new Date(user.ResetTokenExpiry)) {
            return res.status(400).json({ message: 'Reset token has expired' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await Account.updatePassword(user.AccountID, hashedPassword);
        await Account.clearResetToken(user.AccountID);

        res.json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }

    
};

// Render forgot password form
exports.showForgotPasswordForm = (req, res) => {
    res.render('forgot-password'); // You'll need to create this view
};

// Render reset password form
exports.showResetPasswordForm = async (req, res) => {
    const { token } = req.params;
    
    try {
        const user = await Account.findByResetToken(token);
        if (!user || new Date() > new Date(user.ResetTokenExpiry)) {
            return res.render('error', { message: 'Invalid or expired reset token' });
        }
        
        res.render('reset-password', { token }); // You'll need to create this view
    } catch (error) {
        res.render('error', { message: 'Error loading reset form' });
    }
};

