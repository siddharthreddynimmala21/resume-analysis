import nodemailer from 'nodemailer';

// Create a function to get transporter - ensures env variables are loaded
const getTransporter = () => {
    console.log('Creating email transporter with user:', process.env.EMAIL_USER);
    
    // Gmail SMTP configuration
    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        debug: true, // Enable debug logs
        logger: true // Log to console
    });
};

const sendOTPEmail = async (email, otp) => {
    try {
        console.log('Starting email send process to:', email);
        
        // Get a fresh transporter instance
        const transporter = getTransporter();
        
        // Check if email credentials exist
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('Email credentials missing in .env file');
            return false;
        }
        
        // Verify transporter configuration
        console.log('Verifying transporter configuration...');
        try {
            await transporter.verify();
            console.log('Transporter verification successful');
        } catch (verifyError) {
            console.error('Transporter verification failed:', verifyError.message);
            return false;
        }

        // Prepare email data
        const mailOptions = {
            from: {
                name: 'Resume AI',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2563eb;">Email Verification</h1>
                    <p>Your OTP for email verification is:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                        <h2 style="color: #1f2937; margin: 0; font-size: 24px;">${otp}</h2>
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p style="color: #6b7280; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
                </div>
            `,
            text: `Your OTP for email verification is: ${otp}. This OTP will expire in 10 minutes.`
        };

        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', {
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected
        });
        
        return true;    } catch (error) {
        console.error('⚠️ EMAIL SENDING FAILED ⚠️');
        console.error('Error details:', {
            errorName: error.name,
            errorMessage: error.message,
            errorCode: error.code,
            errorCommand: error.command,
            responseCode: error.responseCode,
            response: error.response
        });
        
        // More specific error handling
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Check your Gmail App Password - it may be incorrect or expired.');
            console.error('Make sure 2FA is enabled on your Google account and you\'re using an App Password, NOT your regular password.');
        } else if (error.code === 'ESOCKET') {
            console.error('Socket error. Check your network connection.');
        } else if (error.responseCode === 535) {
            console.error('Username and password not accepted. Make sure your Gmail App Password is correct.');
        } else if (error.code === 'ECONNECTION') {
            console.error('Connection error. SMTP server may be blocking your connection.');
        }
        
        console.error('EMAIL CONFIG:', {
            host: 'smtp.gmail.com',
            port: 465,
            user: process.env.EMAIL_USER ? process.env.EMAIL_USER : 'NOT SET',
            passwordProvided: process.env.EMAIL_PASSWORD ? 'YES' : 'NO'
        });
        
        return false;
    }
};

export {
    sendOTPEmail
};
