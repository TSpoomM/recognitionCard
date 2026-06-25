import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { ImageResponse } from "next/og";
import React from "react";

// Get SMTP details from env
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const EMAIL_FROM = process.env.EMAIL_FROM || "tanapoom@teckbeehang.com";
const TEST_EMAIL_TO = process.env.TEST_EMAIL_TO || "";

// Load Font Data
const getFontData = (fileName: string): Buffer => {
  const filePath = path.join(process.cwd(), "public", "fonts", fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Font file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath);
};

// Core Value Meta styling mapped for Satori
const CORE_VALUE_STYLE: Record<
  string,
  { emoji: string; name: string; bgColor: string; textColor: string }
> = {
  RESPECT: {
    emoji: "🤝",
    name: "Respect",
    bgColor: "#ecfdf5", // emerald-50
    textColor: "#047857", // emerald-700
  },
  LEADERSHIP: {
    emoji: "🌟",
    name: "Leadership",
    bgColor: "#f0f9ff", // sky-50
    textColor: "#0369a1", // sky-700
  },
  COMMUNICATION: {
    emoji: "💬",
    name: "Communication",
    bgColor: "#f5f3ff", // violet-50
    textColor: "#6d28d9", // violet-700
  },
  PROFESSIONALISM: {
    emoji: "💼",
    name: "Professionalism",
    bgColor: "#fffbeb", // amber-50
    textColor: "#b45309", // amber-700
  },
  INTEGRITY: {
    emoji: "🛡️",
    name: "Integrity",
    bgColor: "#fff1f2", // rose-50
    textColor: "#be123c", // rose-700
  },
};

/**
 * Generates a PNG compliment card dynamically from parameters using next/og
 */
export async function generateComplimentCardBuffer({
  recipientName,
  comment,
  coreValues,
  dateString,
}: {
  recipientName: string;
  comment: string;
  coreValues: string[];
  dateString: string;
}): Promise<Buffer> {
  // Load fonts from local public/fonts dir
  const robotoRegular = getFontData("Roboto-Regular.ttf");
  const robotoMedium = getFontData("Roboto-Medium.ttf");
  const greatVibes = getFontData("GreatVibes-Regular.ttf");

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#FAF9F6", // Cream background
          border: "18px solid #FFFFFF", // Thick elegant white border
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        {/* Header Label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span
            style={{
              fontFamily: "Roboto",
              fontWeight: 500,
              fontSize: "13px",
              color: "#94a3b8",
              letterSpacing: "3px",
              marginBottom: "12px",
            }}
          >
            RECOGNITION CARD
          </span>
          <span
            style={{
              fontFamily: "Roboto",
              fontWeight: 500,
              fontSize: "32px",
              color: "#334155",
              textAlign: "center",
            }}
          >
            For: {recipientName}
          </span>
        </div>

        {/* Core Values Badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          {coreValues.map((val) => {
            const cleanVal = val.trim().toUpperCase();
            const meta = CORE_VALUE_STYLE[cleanVal] || {
              emoji: "✨",
              name: val,
              bgColor: "#f1f5f9",
              textColor: "#475569",
            };
            return (
              <span
                key={val}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: meta.bgColor,
                  color: meta.textColor,
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "18px",
                  fontFamily: "Roboto",
                  fontWeight: 500,
                }}
              >
                <span style={{ marginRight: "4px" }}>{meta.emoji}</span>
                {meta.name}
              </span>
            );
          })}
        </div>

        {/* Comment Message */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            padding: "0 20px",
            margin: "15px 0",
            width: "100%",
          }}
        >
          <span
            style={{
              fontFamily: "Roboto",
              fontSize: "20px",
              color: "#1e293b",
              lineHeight: 1.6,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            "{comment}"
          </span>
        </div>

        {/* Footer with script "Thank You" and Star */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span
            style={{
              fontFamily: "GreatVibes",
              fontSize: "58px",
              color: "#0f172a",
              marginBottom: "10px",
            }}
          >
            Thank You
          </span>

          {/* Star SVG icon */}
          <svg
            viewBox="0 0 24 24"
            style={{
              width: "28px",
              height: "28px",
              marginBottom: "12px",
            }}
          >
            <path
              fill="#ef4444"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>

          <span
            style={{
              fontFamily: "Roboto",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            Sent on {dateString}
          </span>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 600,
      fonts: [
        {
          name: "Roboto",
          data: robotoRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Roboto",
          data: robotoMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "GreatVibes",
          data: greatVibes,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );

  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Sends a compliment email containing the generated image card
 */
export async function sendComplimentEmail({
  toEmail,
  recipientName,
  comment,
  coreValues,
}: {
  toEmail: string;
  recipientName: string;
  comment: string;
  coreValues: string[];
}): Promise<{ success: boolean; messageId?: string; info?: any }> {
  // Determine recipient email: Redirect to TEST_EMAIL_TO if provided
  const targetRecipient = TEST_EMAIL_TO || toEmail;

  if (!targetRecipient) {
    console.warn("No recipient email specified and TEST_EMAIL_TO is empty. Skipping email.");
    return { success: false, info: "No email address found" };
  }

  // Format sent date
  const dateString = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  console.log(`Generating card image for ${recipientName}...`);
  const imageBuffer = await generateComplimentCardBuffer({
    recipientName,
    comment,
    coreValues,
    dateString,
  });

  // Verify SMTP Config, log mock if missing
  if (!SMTP_USER || !SMTP_PASS) {
    console.log("================ MOCK EMAIL NOTIFICATION ================");
    console.log(`From: ${EMAIL_FROM}`);
    console.log(`To: ${targetRecipient} (Original Recipient: ${toEmail})`);
    console.log(`Subject: Compliment`);
    console.log(`Details:`);
    console.log(`- Recipient Name: ${recipientName}`);
    console.log(`- Date Sent: ${dateString}`);
    console.log(`- Core Values: ${coreValues.join(", ")}`);
    console.log(`- Comment: ${comment}`);
    console.log(`[Card image generated successfully: ${imageBuffer.length} bytes]`);
    console.log("=========================================================");
    return { success: true, info: "SMTP credentials not configured; mocked email successfully." };
  }

  // Setup Transporter
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"TeckBeeHang Recognition" <${EMAIL_FROM}>`,
    to: targetRecipient,
    subject: "Compliment",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; text-align: center;">You have received a new compliment!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Hello <strong>${recipientName}</strong>,
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Someone has sent you a recognition card to appreciate your hard work and contribution. Please find your recognition card attached below:
        </p>
        
        <!-- Inline Image -->
        <div style="text-align: center; margin: 30px 0;">
          <img src="cid:recognitionCard" alt="Recognition Card" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center;">
          This is an automated email from TeckBeeHang Recognition System.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: "compliment-card.png",
        content: imageBuffer,
        cid: "recognitionCard", // Embed inline
      },
    ],
  };

  console.log(`Sending email from ${EMAIL_FROM} to ${targetRecipient}...`);
  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent successfully: ${info.messageId}`);
  return { success: true, messageId: info.messageId, info };
}
