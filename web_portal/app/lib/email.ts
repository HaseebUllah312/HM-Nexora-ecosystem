import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASSWORD!,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
        if (!to) {
            console.error('Email recipient (to) is missing');
            return false;
        }
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('Email credentials not configured in environment variables');
            return false;
        }

        const mailOptions = {
            from: `"HM nexora" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
        };

        console.log(`Attempting to send email to: ${to} | Subject: ${subject}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: ${info.messageId}`);
        return true;
    } catch (error: any) {
        console.error(`Detailed Error sending email to ${to}:`, {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        return false;
    }
}

/**
 * Verifies if the SMTP transporter is working correctly.
 */
export async function verifyTransporter(): Promise<boolean> {
    try {
        await transporter.verify();
        console.log('Transporter is ready to take our messages');
        return true;
    } catch (error) {
        console.error('Transporter verification failed:', error);
        return false;
    }
}

export function generateOTP(): string {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiryTime(): Date {
    // OTP valid for 10 minutes
    const now = new Date();
    return new Date(now.getTime() + 10 * 60 * 1000);
}

export function getOTPEmailTemplate(username: string, otp: string, type: string = 'registration'): string {
    const isPasswordReset = type === 'password_reset';
    const title = isPasswordReset ? 'Security: Reset Password' : 'Elite Access: Verify Email';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; color: #334155; line-height: 1.6; }
                .wrapper { width: 100%; padding: 40px 10px; box-sizing: border-box; }
                .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.08); }
                .header { background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); padding: 50px 30px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; }
                .content { padding: 45px 35px; text-align: center; }
                .greeting { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
                .message { font-size: 16px; color: #64748b; margin-bottom: 35px; }
                .otp-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 20px; padding: 40px 20px; margin: 30px 0; }
                .otp-code { font-size: 48px; font-weight: 900; color: #7c3aed; letter-spacing: 14px; font-family: 'Monaco', 'Courier New', monospace; margin: 0; }
                .expiry { font-size: 13px; color: #94a3b8; font-weight: 600; margin-top: 15px; text-transform: uppercase; letter-spacing: 1px; }
                .warning { background: #fff7ed; border-radius: 12px; padding: 20px; margin-top: 35px; text-align: left; }
                .warning p { margin: 0; font-size: 14px; color: #9a3412; }
                .footer { padding: 35px; text-align: center; background: #f8fafc; border-top: 1px solid #f1f5f9; }
                .footer p { margin: 6px 0; font-size: 13px; color: #94a3b8; }
                .brand-footer { font-weight: 800; color: #06b6d4; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1>HM nexora</h1>
                        <p style="margin-top: 8px; opacity: 0.9; font-weight: 600;">Secure Authentication</p>
                    </div>
                    <div class="content">
                        <div class="greeting">${isPasswordReset ? 'Password Reset Authorization' : 'Welcome to the Hub!'}</div>
                        <p class="message">
                            ${isPasswordReset
                                ? 'We received a request to access your profile. Use the protected identity code below to securely reset your credentials.'
                                : 'You are one step away from joining our professional academic network. Enter this unique code to verify your identity.'}
                        </p>
                        
                        <div class="otp-box">
                            <p style="text-transform: uppercase; font-size: 11px; font-weight: 800; color: #94a3b8; margin-bottom: 20px; letter-spacing: 2px;">Your One-Time Access Code</p>
                            <div class="otp-code">${otp}</div>
                            <p class="expiry">Expires in 10 minutes</p>
                        </div>

                        <div class="warning">
                            <p><strong>🛡️ Security Protocol:</strong> If you did not initiate this request, your account may be under investigation. Please do not share this code with anyone, including our support team.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2026 <a href="https://hmnexora.tech" class="brand-footer">HM nexora</a> — Elite Academic Solutions</p>
                        <p>HSM TECH — Building the Future of Education</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

export function getWelcomeEmailTemplate(username: string, email: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f1f5f9; color: #334155; }
                .wrapper { width: 100%; padding: 40px 10px; box-sizing: border-box; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); padding: 70px 30px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1.5px; }
                .content { padding: 50px 40px; text-align: center; }
                .hero-title { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 15px; }
                .card { background: #f8fafc; border-radius: 20px; padding: 25px; margin-bottom: 20px; text-align: left; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
                .card-icon { font-size: 28px; margin-bottom: 15px; display: block; }
                .card-title { font-weight: 800; color: #06b6d4; margin: 0 0 5px 0; font-size: 18px; }
                .card-desc { font-size: 14px; color: #64748b; margin: 0; line-height: 1.5; }
                .cta-button { display: inline-block; background: linear-gradient(90deg, #06b6d4, #7c3aed); color: white; padding: 18px 45px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 16px; margin-top: 40px; box-shadow: 0 10px 25px rgba(6, 182, 212, 0.4); transition: transform 0.2s; }
                .footer { padding: 40px; text-align: center; background: #f8fafc; font-size: 13px; color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1>HM nexora</h1>
                        <p style="opacity: 0.9; margin-top: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; font-size: 12px;">Igniting Academic Potential</p>
                    </div>
                    <div class="content">
                        <div class="hero-title">Welcome to the Inner Circle, ${username}!</div>
                        <p style="color: #64748b; font-size: 17px; margin-bottom: 45px; line-height: 1.7;">Your account is fully activated. You now have exclusive access to the most advanced handout repository and AI study tools available.</p>
                        
                        <div class="card">
                            <span class="card-icon">💎</span>
                            <p class="card-title">Premium Resources</p>
                            <p class="card-desc">Access 20,000+ official handouts, midterm papers, and final-term solutions organized by subject code.</p>
                        </div>
                        
                        <div class="card">
                            <span class="card-icon">🧠</span>
                            <p class="card-title">AI Study Assistant</p>
                            <p class="card-desc">Get instant answers and simplified explanations for your most difficult course topics.</p>
                        </div>

                        <div class="card">
                            <span class="card-icon">⚡</span>
                            <p class="card-title">Smart Vault</p>
                            <p class="card-desc">Follow subjects to receive instant email notifications for new materials and exam dates.</p>
                        </div>

                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://hmnexora.tech'}/dashboard" class="cta-button">Enter My Vault →</a>
                    </div>
                    <div class="footer">
                        <p>© 2026 HM nexora. All rights reserved.</p>
                        <p style="margin-top: 10px;">Designed for high-performance students globally.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

export function getAnnouncementEmailTemplate(title: string, description: string, category: string, deadline?: string, imageUrl?: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f1f5f9; color: #1e293b; line-height: 1.6; }
                .wrapper { width: 100%; padding: 40px 10px; box-sizing: border-box; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.06); }
                .header { background: #0f172a; padding: 40px 30px; text-align: left; }
                .header h1 { margin: 0; color: #06b6d4; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
                .content { padding: 45px 35px; }
                .badge { display: inline-block; background: #f1f5f9; color: #475569; padding: 6px 16px; border-radius: 99px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; border: 1px solid #e2e8f0; }
                .announcement-title { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0 0 20px 0; line-height: 1.3; }
                .deadline-box { background: #fef2f2; border-left: 6px solid #ef4444; border-radius: 4px 16px 16px 4px; padding: 25px; margin: 30px 0; border: 1px solid #fee2e2; }
                .description { font-size: 16px; color: #334155; white-space: pre-wrap; margin-bottom: 40px; line-height: 1.8; }
                .footer { padding: 35px; text-align: center; background: #f8fafc; font-size: 12px; color: #94a3b8; }
                .button { display: inline-block; background: #0f172a; color: white; padding: 16px 35px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; }
                .img-container { margin: 30px 0; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
            </style>
        </head>
        <body>
             <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1>HM nexora</h1>
                        <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px; font-weight: 600;">Platform Intel & Updates</p>
                    </div>
                    <div class="content">
                        <div class="badge">📢 ${category}</div>
                        <h2 class="announcement-title">${title}</h2>
                        
                        ${imageUrl ? `
                        <div class="img-container">
                            <img src="${imageUrl}" alt="Announcement" style="width: 100%; height: auto; display: block; object-fit: cover;" />
                        </div>
                        ` : ''}

                        ${deadline ? `
                        <div class="deadline-box">
                            <p style="margin:0; color: #b91c1c; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">🕒 Priority Deadline</p>
                            <p style="margin:8px 0 0 0; color: #1e293b; font-size: 22px; font-weight: 900;">${new Date(deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        ` : ''}

                        <div class="description">${description}</div>
                        
                        <div style="text-align: center; margin-top: 50px;">
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://hmnexora.tech'}/announcements" class="button">View Full Details →</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2026 HM nexora. You are receiving this because you're a verified member of our hub.</p>
                        <p style="margin-top: 10px;">To manage notifications, visit your Profile Settings.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

export function getGenericNotificationTemplate(title: string, message: string, actionLabel?: string, actionUrl?: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f1f5f9; color: #334155; }
                .wrapper { width: 100%; padding: 40px 10px; box-sizing: border-box; }
                .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: #06b6d4; padding: 35px; text-align: center; color: white; }
                .content { padding: 45px 35px; text-align: center; }
                .footer { padding: 35px; text-align: center; background: #f8fafc; font-size: 12px; color: #94a3b8; }
                .button { display: inline-block; background: #06b6d4; color: white; padding: 15px 35px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1 style="margin:0; font-size: 24px; font-weight: 900;">HM nexora</h1>
                    </div>
                    <div class="content">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 800;">${title}</h2>
                        <p style="color: #64748b; font-size: 16px; line-height: 1.7;">${message}</p>
                        ${actionLabel && actionUrl ? `
                            <a href="${actionUrl}" class="button">${actionLabel}</a>
                        ` : ''}
                    </div>
                    <div class="footer">
                        <p>© 2026 HM nexora Professional Service. Your academic excellence partner.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}
