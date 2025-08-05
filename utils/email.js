const nodemailer = require("nodemailer");

// Use your Gmail, Outlook, or SendGrid SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_PASSWORD,
  },
});

const sendEmail = async (to, subject, text) => {
  // Check if email configuration is available
  if (!process.env.ALERT_EMAIL || !process.env.ALERT_PASSWORD) {
    console.error(
      "❌ Email configuration missing: ALERT_EMAIL or ALERT_PASSWORD not set"
    );
    throw new Error("Email configuration missing");
  }

  const mailOptions = {
    from: `"Uptime Monitor" <${process.env.ALERT_EMAIL}>`,
    to,
    subject,
    text,
  };

  try {
    console.log(`📧 Attempting to send email to ${to}...`);
    console.log(`📧 From: ${process.env.ALERT_EMAIL}`);
    console.log(`📧 Subject: ${subject}`);

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    console.error("❌ Error details:", error);
    throw error; // Re-throw to handle in calling function
  }
};

module.exports = sendEmail;
