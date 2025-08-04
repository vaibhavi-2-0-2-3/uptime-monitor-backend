const nodemailer = require("nodemailer");

// Use your Gmail, Outlook, or SendGrid SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL, // Your email (e.g., uptimealerts@gmail.com)
    pass: process.env.ALERT_PASSWORD, // App password (not your normal password)
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"Uptime Monitor" <${process.env.ALERT_EMAIL}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("Email send error:", error.message);
  }
};

module.exports = sendEmail;
