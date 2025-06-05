const Account = require('../models/account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
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
        if (error.message.includes('Violation of UNIQUE KEY constraint')) {
            if (error.message.includes('Email')) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            if (error.message.includes('Username')) {
                return res.status(400).json({ message: 'Username already exists' });
            }
        }
        res.status(500).json({ message: 'Error registering user', error: error.message });
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

        // Tạo reset token bằng JWT
        const resetTokenExpiryMinutes = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 15; // Thời gian hết hạn token (mặc định 15 phút)
        const resetToken = jwt.sign(
            { accountId: user.AccountID }, // Payload chứa accountId
            process.env.JWT_SECRET, // Secret key để ký token
            { expiresIn: `${resetTokenExpiryMinutes}m` } // Thời gian hết hạn
        );
        
        // Lưu token vào cơ sở dữ liệu
        await Account.saveResetToken(user.AccountID, resetToken);

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

        // Verify token using JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.accountId !== user.AccountID) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await Account.updatePassword(user.AccountID, hashedPassword);
        await Account.clearResetToken(user.AccountID);

        res.json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid reset token' });
        }
        res.status(500).json({ message: 'Error resetting password' });
    }

    
};

// Render forgot password form
exports.showForgotPasswordForm = (req, res) => {
    res.render('forgot-password');
};

// Render reset password form
exports.showResetPasswordForm = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await Account.findByResetToken(token);
        if (!user) {
            return res.render('error', { message: 'Invalid reset token' });
        }

        // Xác thực token bằng JWT
        jwt.verify(token, process.env.JWT_SECRET, (err) => {
            if (err) {
                return res.render('error', { message: 'Invalid or expired reset token' });
            }
            res.render('reset-password', { token });
        });
    } catch (error) {
        res.render('error', { message: 'Error loading reset form' });
    }
};

module.exports = exports;