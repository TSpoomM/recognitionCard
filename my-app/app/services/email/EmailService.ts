import nodemailer from "nodemailer";
import { EMAIL_CONFIG } from "./emailConfig";
import { RecognitionCardImageRenderer } from "./RecognitionCardImage";
import { CardLanguage } from "../../types/cardLanguage";
import { TRANSLATIONS } from "../../constants/translations";

type SendComplimentEmailParams = {
  toEmail: string | string[];
  recipientName: string;
  recipientDisplayName?: string;
  recipientDisplayNames?: string[];
  recognizedByName: string;
  comment: string;
  coreValues: string[];
  cardLanguage: CardLanguage;
};

type EmailResult = {
  success: boolean;
  messageId?: string;
  info?: unknown;
};

const MOCK_ALL_STAFF_CC = ["clinserhope@gmail.com", "tspoom.m@gmail.com"];

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
    const ccRecipients = MOCK_ALL_STAFF_CC;

    if (targetRecipients.length === 0) {
      console.warn("No recipient email specified and TEST_EMAIL_TO is empty. Skipping email.");
      return { success: false, info: "No email address found" };
    }

    const dateString = new Intl.DateTimeFormat(cardLanguage === "th" ? "th-TH" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    console.log(`Generating card image for ${recipientName}...`);
    const attachmentFileName = TRANSLATIONS[cardLanguage].fileName;
    const subject = TRANSLATIONS[cardLanguage].subject;
    const imageBuffer = await RecognitionCardImageRenderer.renderToBuffer({
      recipientName,
      recognizedByName,
      comment,
      coreValues,
      cardLanguage,
      dateString,
    });

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
      console.log(`- Card Language: ${cardLanguage}`);
      console.log(`- Core Values: ${coreValues.join(", ")}`);
      console.log(`- Comment: ${comment}`);
      console.log(`- Attachment Filename: ${attachmentFileName}`);
      console.log(`[Card image generated successfully: ${imageBuffer.length} bytes]`);
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
      html: EmailService.buildHtml(recipientDisplayName || recipientName, cardLanguage, recipientDisplayNames),
      attachments: [
        {
          filename: attachmentFileName,
          content: imageBuffer,
          cid: "recognitionCard",
        },
        {
          filename: attachmentFileName,
          content: imageBuffer,
          contentDisposition: "attachment",
        },
      ],
    });

    console.log("recipientName: ", recipientName);
    console.log("targetRecipients: ", targetRecipients);
    console.log("ccRecipients: ", ccRecipients);


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

  private static buildHtml(recipientDisplayName: string, cardLanguage: CardLanguage, recipientDisplayNames?: string[]) {
    const isThai = cardLanguage === "th";
    // const heading = isThai ? "คุณได้รับบัตรส่งต่อคุณค่า !" : "You've received a recognition card!";
    const heading = isThai ? "เราขอชื่นชม" : "We would like to recognize";
    // const intro = isThai ? "เราขอชื่นชม" : "We would like to recognize";
    const note = isThai ? "ขอบคุณที่ร่วมสร้างสิ่งดี ๆ ให้เกิดขึ้นในทีม" : "Thank you for making a positive difference to the team.";

    let namesHtml: string;
    if (recipientDisplayNames && recipientDisplayNames.length > 0) {
      const rows: string[] = [];
      for (let i = 0; i < recipientDisplayNames.length; i += 2) {
        const name1 = EmailService.escapeHtml(recipientDisplayNames[i]);
        const name2 = i + 1 < recipientDisplayNames.length ? EmailService.escapeHtml(recipientDisplayNames[i + 1]) : "";
        const col2 = name2
          ? `<td style="width:50%;padding:6px 8px;text-align:start;color:#0f766e;font-size:17px;font-weight:700;line-height:1.4;">${name2}</td>`
          : '<td style="width:50%;"></td>';
        rows.push(`<tr><td style="width:50%;padding:6px 8px;text-align:start;color:#0f766e;font-size:17px;font-weight:700;line-height:1.4;">${name1}</td>${col2}</tr>`);
      }
      namesHtml = `<table style="margin:0 auto;border-collapse:collapse;"><tbody>${rows.join("")}</tbody></table>`;
    } else {
      const safeName = EmailService.escapeHtml(recipientDisplayName);
      namesHtml = `<p style="margin:0;color:#0f766e;font-size:25px;font-weight:700;line-height:1.4;">${safeName}</p>`;
    }

    return `
      <div style="margin:0;background:#f0fdfa;padding:32px 12px;font-family:Arial,'Noto Sans Thai',sans-serif;color:#0f172a;">
        <div style="max-width:760px;margin:0 auto;overflow:hidden;border:1px solid #f3d37a;border-radius:24px;background:#fff;box-shadow:0 12px 32px rgba(15,118,110,.12);">
          <div style="height:8px;background:linear-gradient(90deg,#0f766e,#14b8a6,#f6c453);"></div>
          <div style="padding:30px 24px 10px;text-align:center;">
            <div style="display:inline-block;margin-bottom:14px;border-radius:999px;background:#ccfbf1;padding:7px 14px;color:#115e59;font-size:12px;font-weight:700;letter-spacing:1.5px;">TECKBEEHANG RECOGNITION</div>
            <h1 style="margin:0;color:#134e4a;font-size:28px;line-height:1.35;">${heading}</h1>
            ${namesHtml}
          </div>
          <div style="padding:18px 24px;text-align:center;">
            <img src="cid:recognitionCard" alt="Recognition Card" width="660" style="display:block;width:660px;max-width:100%;height:auto;margin:0 auto;border-radius:16px;box-shadow:0 8px 24px rgba(15,23,42,.14);" />
          </div>
          <div style="padding:4px 24px 28px;text-align:center;color:#475569;font-size:15px;line-height:1.6;">${note}</div>
          <div style="border-top:1px solid #e2e8f0;background:#f8fafc;padding:16px 24px;text-align:center;color:#94a3b8;font-size:12px;line-height:1.5;">This is an automated email from TeckBeeHang Recognition System.</div>
        </div>
      </div>
    `;
  }
}
//   private static buildHtml(recipientName: string) {
//     return `
//       <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
//         <h2 style="color: #0f172a; text-align: center;">You have received a new compliment!</h2>
//         <p style="color: #475569; font-size: 16px; line-height: 1.5;">
//           To: <strong>${recipientName}</strong>
//         </p>
//         <p style="color: #475569; font-size: 16px; line-height: 1.5;">
//           Someone has sent you a recognition card to appreciate your hard work and contribution. Please find your recognition card attached below:
//         </p>
//         <div style="text-align: center; margin: 30px 0;">
//           <img src="cid:recognitionCard" alt="Recognition Card" width="660" style="width: 660px; max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
//         </div>
//         <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center;">
//           This is an automated email from TeckBeeHang Recognition System.
//         </p>
//       </div>
//     `;
//   }
// }
