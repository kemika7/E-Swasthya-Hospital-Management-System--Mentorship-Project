const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (to, otp, purpose = 'registration') => {
    try {
        let subject = '';
        let html = '';

        if (purpose === 'registration') {
            subject = 'Verify Your Account - E-Swasthya HMS';
            html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">Welcome to E-Swasthya!</h2>
                <p style="font-size: 16px; color: #333;">Thank you for registering. Please use the following OTP to verify your account:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
                </div>
                <p style="font-size: 14px; color: #666;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
            `;
        } else if (purpose === 'reset-password') {
            subject = 'Password Reset Request - E-Swasthya HMS';
            html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2196F3; text-align: center;">Password Reset Request</h2>
                <p style="font-size: 16px; color: #333;">We received a request to reset your password. Please use the following OTP to proceed:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
                </div>
                <p style="font-size: 14px; color: #666;">This OTP is valid for 10 minutes. If you did not request a password reset, please secure your account.</p>
            </div>
            `;
        }

        const mailOptions = {
            from: `"E-Swasthya HMS" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendOTP
};
