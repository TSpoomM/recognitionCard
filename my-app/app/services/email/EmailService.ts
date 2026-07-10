import nodemailer from "nodemailer";
import { EMAIL_CONFIG } from "./emailConfig";
import { RecognitionCardImageRenderer } from "./RecognitionCardImage";
import { CardLanguage } from "../../types/cardLanguage";

type SendComplimentEmailParams = {
  toEmail: string | string[];
  recipientName: string;
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
      console.log("Subject: Compliment");
      console.log("Details:");
      console.log(`- Recipient Name: ${recipientName}`);
      console.log(`- Recognized By: ${recognizedByName}`);
      console.log(`- Date Sent: ${dateString}`);
      console.log(`- Card Language: ${cardLanguage}`);
      console.log(`- Core Values: ${coreValues.join(", ")}`);
      console.log(`- Comment: ${comment}`);
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
      subject: "Compliment",
      html: EmailService.buildHtml(recipientName),
      attachments: [
        {
          filename: "compliment-card.png",
          content: imageBuffer,
          cid: "recognitionCard",
        },
        {
          filename: "compliment-card.png",
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

  private static buildHtml(recipientName: string) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; text-align: center;">You have received a new compliment!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          To: <strong>${recipientName}</strong>
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <img src="cid:recognitionCard" alt="Recognition Card" width="660" style="width: 660px; max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
        </div>
        <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center;">
          This is an automated email from TeckBeeHang Recognition System.
        </p>
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
