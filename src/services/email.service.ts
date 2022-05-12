import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass,
    }
});

/**
 * Send Email Verification
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
async function sendEmail(to: string, subject: string, text: string) {
    try {
        await transporter.sendMail({ from: config.email.from, to, subject, text });
    } catch (err) {
        console.log(err);
    }
}

/**
 * Send Email Verification
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
async function sendEmailVerification(to: string, token: string) {
    try {
        const subject = 'Email Verification';
        // replace this url with the link to the email verification page of your front-end app
        const verificationEmailUrl = `http://localhost:3000/auth/verify-email?token=${token}`;
        const text = `Dear user,
        To verify your email, click on this link: ${verificationEmailUrl}
        If you did not create an account, then ignore this email.`;
        await sendEmail(to, subject, text);

    } catch (err) {
        console.log(err);
    }
}

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to: string, token: string) => {
    const subject = 'Reset password';
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `http://localhost:3000/auth/reset-password?token=${token}&mobileNumberOrEmail=1`;
    const text = `Dear user,To reset your password, click on this link: ${resetPasswordUrl}
    If you did not request any password resets, then ignore this email.`;
    await sendEmail(to, subject, text);

};

export default {
    sendEmailVerification,
    sendResetPasswordEmail
}
