import nodemailer from "nodemailer";
import { EMAIL_CONFIG } from "./emailConfig";
import { RecognitionCardImageRenderer } from "./RecognitionCardImage";
import { CardLanguage } from "../../types/cardLanguage";

type SendComplimentEmailParams = {
  toEmail: string | string[];
  recipientName: string;
  recipientDisplayName?: string;
  recipientDisplayNames?: string[];
  recognizedByName: string;
  comment: string;
  coreValues: string[];
  cardLanguage?: CardLanguage;
};

type EmailResult = {
  success: boolean;
  messageId?: string;
  info?: unknown;
};

const EMAIL_COPY: Record<CardLanguage, { fileName: string; subject: string }> = {
  en: {
    fileName: "Recognition-Card.png",
    subject: "You have received a Recognition card!!",
  },
  th: {
    fileName: "บัตรส่งต่อคุณค่า.png",
    subject: "คุณได้รับคำชื่นชม !!",
  },
};

export class EmailService {
  static async sendComplimentEmail({
    toEmail,
    recipientName,
    recipientDisplayName,
    recipientDisplayNames,
    recognizedByName,
    comment,
    coreValues,
    cardLanguage,
  }: SendComplimentEmailParams): Promise<EmailResult> {
    const originalRecipients = EmailService.normalizeEmails(toEmail);
    const testRecipients = EmailService.normalizeEmails(EMAIL_CONFIG.testEmailTo);
    const targetRecipients = testRecipients.length > 0 ? testRecipients : originalRecipients;
    const ccRecipients = EMAIL_CONFIG.ccTo;
    const safeCardLanguage: CardLanguage = cardLanguage === "th" ? "th" : "en";

    if (targetRecipients.length === 0) {
      console.warn("No recipient email specified and TEST_EMAIL_TO is empty. Skipping email.");
      return { success: false, info: "No email address found" };
    }

    const dateString = new Intl.DateTimeFormat(safeCardLanguage === "th" ? "th-TH" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    console.log(`Generating card image for ${recipientName}...`);
    const attachmentFileName = EMAIL_COPY[safeCardLanguage].fileName;
    const subject = EMAIL_COPY[safeCardLanguage].subject;
    const imageProps = {
      recipientName,
      recipientDisplayName,
      recipientDisplayNames,
      recognizedByName,
      comment,
      coreValues,
      cardLanguage: safeCardLanguage,
      dateString,
    };
    const { emailBuffer: emailImageBuffer, cardBuffer: cardImageBuffer } =
      await RecognitionCardImageRenderer.renderEmailAndCardToBuffers(imageProps);

    if (!EMAIL_CONFIG.smtpUser || !EMAIL_CONFIG.smtpPass) {
      console.log("================ MOCK EMAIL NOTIFICATION ================");
      console.log(`From: ${EMAIL_CONFIG.emailFrom}`);
      console.log(`To: ${targetRecipients.join(", ")} (Original Recipient: ${originalRecipients.join(", ")})`);
      console.log(`Cc: ${ccRecipients.join(", ")}`);
      console.log(`Subject: ${subject}`);
      console.log("Details:");
      console.log(`- Recipient Name: ${recipientName}`);
      console.log(`- Recognized By: ${recognizedByName}`);
      console.log(`- Date Sent: ${dateString}`);
      console.log(`- Card Language: ${safeCardLanguage}`);
      console.log(`- Core Values: ${coreValues.join(", ")}`);
      console.log(`- Comment: ${comment}`);
      console.log(`- Attachment Filename: ${attachmentFileName}`);
      console.log(`[Email image generated successfully: ${emailImageBuffer.length} bytes]`);
      console.log(`[Card attachment generated successfully: ${cardImageBuffer.length} bytes]`);
      console.log("=========================================================");
      return { success: true, info: "SMTP credentials not configured; mocked email successfully." };
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.smtpHost,
      port: EMAIL_CONFIG.smtpPort,
      secure: EMAIL_CONFIG.smtpSecure,
      auth: {
        user: EMAIL_CONFIG.smtpUser,
        pass: EMAIL_CONFIG.smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"TeckBeeHang Recognition" <${EMAIL_CONFIG.emailFrom}>`,
      to: targetRecipients,
      cc: ccRecipients,
      subject: subject,
      html: EmailService.buildHtml(recipientDisplayName || recipientName, safeCardLanguage),
      attachments: [
        {
          filename: "Recognition-Email.png",
          content: emailImageBuffer,
          cid: "recognitionEmail",
          contentDisposition: "inline",
        },
        {
          filename: attachmentFileName,
          content: cardImageBuffer,
          contentDisposition: "attachment",
        },
      ],
    });

    console.log(`Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId, info };
  }

  private static normalizeEmails(value: string | string[]) {
    const values = Array.isArray(value) ? value : value.split(",");
    return values.map((email) => email.trim()).filter(Boolean);
  }

  private static escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
  }

  private static buildHtml(recipientDisplayName: string, cardLanguage: CardLanguage) {
    const isThai = cardLanguage === "th";
    const heading = isThai ? "คุณได้รับบัตรส่งต่อคุณค่า !" : "You've received a recognition card!";
    const note = isThai ? "เราขอชื่นชม" : "We would like to recognize";
    const safeName = EmailService.escapeHtml(recipientDisplayName);
    const fallbackText = `${heading} ${note} ${safeName}`;

    return `
      <div style="margin:0;background:#ecfffb;padding:16px 0;font-family:Arial,'Noto Sans Thai',sans-serif;color:#0f172a;text-align:center;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${fallbackText}</div>
        <div style="max-width:1200px;margin:0 auto;text-align:center;">
          <img src="cid:recognitionEmail" alt="${fallbackText}" width="1200" style="display:block;width:1200px;max-width:100%;height:auto;margin:0 auto;border:0;outline:none;text-decoration:none;" />
        </div>
      </div>
    `;
  }
}
