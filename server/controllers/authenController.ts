import { Request, Response } from 'express';
import Account from '../models/account';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

interface RegisterRequestBody {
    username: string;
    email: string;
    password: string;
    fullName: string;
    dateOfBirth: string | null;
}

interface LoginRequestBody {
    email: string;
    password: string;
}

interface ForgotPasswordRequestBody {
    email: string;
}

interface ResetPasswordRequestBody {
    newPassword: string;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {
    const { username, email, password, fullName, dateOfBirth } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const userId = await Account.create(
            username,
            email,
            hashedPassword,
            fullName,
            dateOfBirth ? new Date(dateOfBirth) : null
        );
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error: any) {
        if (error.message.includes('Violation of UNIQUE KEY constraint')) {
            if (error.message.includes('Email')) {
                res.status(400).json({ message: 'Email already exists' });
                return;
            }
            if (error.message.includes('Username')) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            }
        }
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await Account.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.Password))) {
            req.session.user = user;
            res.status(201).json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ message: 'Wrong email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Error logging in' });
    }
};

export const logout = (req: Request, res: Response): void => {
    req.session.destroy((err: any) => {
        if (err) {
            res.status(500).json({ message: 'Error logging out' });
            return;
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out' });
    });
};

export const forgotPassword = async (req: Request<{}, {}, ForgotPasswordRequestBody>, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
        const user = await Account.findByEmail(email);
        if (!user) {
            res.status(404).json({ message: 'User not found with this email' });
            return;
        }

        const resetTokenExpiryMinutes = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES as string) || 15;
        const resetToken = jwt.sign(
            { accountId: user.AccountID },
            process.env.JWT_SECRET as string,
            { expiresIn: `${resetTokenExpiryMinutes}m` }
        );

        await Account.saveResetToken(user.AccountID, resetToken);

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
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending reset email' });
    }
};

export const resetPassword = async (
    req: Request<{ token: string }, {}, ResetPasswordRequestBody>,
    res: Response
): Promise<void> => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await Account.findByResetToken(token);
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { accountId: number };
        if (decoded.accountId !== user.AccountID) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Account.updatePassword(user.AccountID, hashedPassword);
        await Account.clearResetToken(user.AccountID);

        res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
        console.error('Reset password error:', error);
        if (error.name === 'TokenExpiredError') {
            res.status(400).json({ message: 'Reset token has expired' });
            return;
        }
        if (error.name === 'JsonWebTokenError') {
            res.status(400).json({ message: 'Invalid reset token' });
            return;
        }
        res.status(500).json({ message: 'Error resetting password' });
    }
};

export const showForgotPasswordForm = (req: Request, res: Response): void => {
    res.render('forgot-password');
};

export const showResetPasswordForm = async (req: Request<{ token: string }>, res: Response): Promise<void> => {
    const { token } = req.params;

    try {
        const user = await Account.findByResetToken(token);
        if (!user) {
            res.render('error', { message: 'Invalid reset token' });
            return;
        }

        jwt.verify(token, process.env.JWT_SECRET as string, (err: any) => {
            if (err) {
                res.render('error', { message: 'Invalid or expired reset token' });
                return;
            }
            res.render('reset-password', { token });
        });
    } catch (error: any) {
        res.render('error', { message: 'Error loading reset form' });
    }
};