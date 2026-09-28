// Production CCs every recognition email to all staff. Set CC_EMAIL_TO in
// .env (e.g. CC_EMAIL_TO=) to override this locally during testing so you
// don't spam the whole company — leaving it unset keeps the production default.
const DEFAULT_CC_TO = ["staff@teckbeehang.com"];

function parseCcTo(raw: string | undefined): string[] {
  if (raw === undefined) return DEFAULT_CC_TO;
  // Tolerate optional [brackets] around the list (e.g. CC_EMAIL_TO=[a@x.com, b@x.com]).
  const unwrapped = raw.trim().replace(/^\[/, "").replace(/\]$/, "");
  return unwrapped.split(",").map((email) => email.trim()).filter(Boolean);
}

const smtpUser = process.env.SMTP_USER || "";

export const EMAIL_CONFIG = {
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser,
  smtpPass: process.env.SMTP_PASS || "",
  smtpSecure: process.env.SMTP_SECURE === "true",
  // Falls back to the authenticated SMTP account so the "From" header is
  // always valid even when EMAIL_FROM isn't set for a given environment.
  emailFrom: process.env.EMAIL_FROM || smtpUser,
  testEmailTo: process.env.TEST_EMAIL_TO || "",
  ccTo: parseCcTo(process.env.CC_EMAIL_TO),
};
