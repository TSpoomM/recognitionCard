export const EMAIL_CONFIG = {
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpSecure: process.env.SMTP_SECURE === "true",
  // emailFrom: process.env.EMAIL_FROM || "tanapoom@teckbeehang.com",
  emailFrom: process.env.EMAIL_FROM,
  testEmailTo: process.env.TEST_EMAIL_TO || "",
};
