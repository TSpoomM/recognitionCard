import fs from "fs";
import path from "path";
import React from "react";
import { renderToReadableStream } from "react-dom/server.edge";
import puppeteer from "puppeteer";
import { StarSection } from "./starComment";
import { CardLanguage } from "../../types/cardLanguage";

/**
 * This renderer reproduces the "TBH Recognition Card" HTML template
 * (index.html) using next/og's ImageResponse (Satori).
 *
 * Satori does not support: CSS Grid, clip-path, ::before/::after pseudo
 * elements, or @import'ed web fonts. Everywhere the template used one of
 * those, this file uses the closest Satori-safe equivalent:
 *   - grid layout        -> flexbox
 *   - hexagon clip-path   -> rounded-rect badge
 *   - ::after dashed line -> a real bottom-bordered <div>
 *   - Poppins             -> Roboto (already loaded as a local font)
 *   - Dancing Script       -> GreatVibes (already loaded as a local font)
 * If you'd rather have the exact template fonts, drop Poppins/Dancing
 * Script .ttf files into public/fonts and swap the family names below.
 */

const CARD_WIDTH = 1100;
const CARD_HEIGHT = 790;

const PALETTE = {
  cream: "#f5f6f1",
  black: "#000000",
  darkGreen: "#0c3a22",
  green1: "#165c30",
  green2: "#1f7040",
  green3: "#2f8a4a",
  green4: "#4aab5a",
  green5: "#82be40",
  accent: "#a8d840",
  textDark: "#2c3c28",
  textMuted: "#556650",
  textFaint: "#7a8875",
  lineGray: "#9baa8e",
  dashGray: "#c8d3be",
  panelBg: "#edf0e8",
  white: "#ffffff",
};

type RecognitionCardImageProps = {
  recipientName: string;
  recognizedByName: string;
  comment: string;
  coreValues: string[];
  cardLanguage: CardLanguage;
  dateString: string;
};

function getFontData(fileName: string): Buffer {
  const filePath = path.join(process.cwd(), "public", "fonts", fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Font file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath);
}

function getFontDataUri(fileName: string): string {
  return `data:font/ttf;base64,${getFontData(fileName).toString("base64")}`;
}

function getImageDataUri(fileName: string, mimeType: string): string {
  const filePath = path.join(process.cwd(), "public", fileName);
  if (!fs.existsSync(filePath)) {
    return "";
  }
  const buffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

type StarKey = "S" | "T" | "A" | "R";

const STAR_ORDER: StarKey[] = ["S", "T", "A", "R"];

const STAR_META: Record<StarKey, { word: string; questions: Record<CardLanguage, string>; bg: string }> = {
  S: {
    word: "SITUATION",
    questions: {
      en: "What was the situation or context?",
      th: "คุณต้องการชื่นชมเรื่องอะไร",
    },
    bg: PALETTE.darkGreen,
  },
  T: {
    word: "TASK",
    questions: {
      en: "What was the task or challenge?",
      th: "บทบาทหน้าที่ของบุคคลนั้น คืออะไร",
    },
    bg: PALETTE.green1,
  },
  A: {
    word: "ACTION",
    questions: {
      en: "What action did you take?",
      th: "บุคคลนั้นได้ลงมือทำอะไร",
    },
    bg: PALETTE.green3,
  },
  R: {
    word: "RESULT",
    questions: {
      en: "What was the result or impact?",
      th: "ผลลัพธ์ที่ได้ คืออะไร?",
    },
    bg: PALETTE.green5,
  },
};

function StarIcon({ letter }: { letter: StarKey }) {
  const common = { width: 16, height: 16 } as const;
  switch (letter) {
    case "S":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <path
            fill="#ffffff"
            d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
          />
        </svg>
      );
    case "T":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <circle cx="12" cy="12" r="10" fill="none" stroke="#ffffff" strokeWidth={2} />
          <path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth={2} fill="none" strokeLinecap="round" />
        </svg>
      );
    case "A":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <path
            fill="#ffffff"
            d="M13.13 22.19L11.5 18.36c1.74-.84 3.31-1.99 4.7-3.46-1.34 2.83-2.84 5.66-3.07 7.29zM5.64 12.5c.93-1.39 2.08-2.96 3.46-4.7l3.63 1.63-7.09 3.07zm12.96-9.7a.996.996 0 00-.82-.3 22.05 22.05 0 00-9.52 4.11L4.63 6.43a1 1 0 00-1.25.15l-1.82 1.82a1 1 0 00.15 1.53l2.38 1.59-1.75 1.75a1 1 0 000 1.41l5.02 5.02a1 1 0 001.41 0l1.75-1.75 1.59 2.38a1 1 0 001.53.15l1.82-1.82a1 1 0 00.15-1.25l-.19-3.65a22 22 0 004.11-9.52 1 1 0 00-.28-.74z"
          />
        </svg>
      );
    case "R":
      return (
        <svg viewBox="0 0 24 24" style={common}>
          <path fill="#ffffff" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
        </svg>
      );
  }
}

function SparkleIcon({ size = 16, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, display: "flex" }}>
      <path
        fill={color}
        d="M12 2c.6 3.7 1.9 5.9 5 7-3.1 1.1-4.4 3.3-5 7-.6-3.7-1.9-5.9-5-7 3.1-1.1 4.4-3.3 5-7z"
      />
    </svg>
  );
}

function StarBadgeIcon({ size = 15, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, display: "flex" }}>
      <path
        fill={color}
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}

function CheckIcon({ size = 15, color = "#ffffff", strokeWidth = 2.6 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, display: "flex" }}>
      <path
        d="M4 12.5l5 5L20 6"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CoreValueMeta = {
  key: string;
  labels: Record<CardLanguage, { name: string; description: string }>;
  circleColor: string;
  icon: React.ReactNode;
};

const cvCommonStyle = { width: 34, height: 34 };

const CORE_VALUES_META: CoreValueMeta[] = [
  {
    key: "RESPECT",
    labels: {
      en: {
        name: "RESPECT",
        description: "Respects others and treats everyone equally.",
      },
      th: {
        description: "เคารพผู้อื่นและปฏิบัติต่อทุกคนอย่างเท่าเทียม",
        name: "การเครพให้เกียรติซึ่งกันและกัน",
      },
    },
    circleColor: PALETTE.green4,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={PALETTE.darkGreen}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={cvCommonStyle}
      >
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.83-3.83a3 3 0 0 0-3.88-.18a3 3 0 0 0-1.89 1.54l-1.5 3.5" />
        <path d="M22 11.5V11a2 2 0 0 0-2-2h-3" />
        <path d="m8.5 8.5 1.5 1.5" />
        <path d="M12 11a2 2 0 0 0-2-2h-3" />
        <path d="M2 11.5V15a2 2 0 0 0 2 2h2" />
        <path d="M22 11.5a2 2 0 1 0-4 0v3a2 2 0 0 0 4 0Z" />
        <path d="M2 11.5a2 2 0 1 1 4 0v3a2 2 0 0 1-4 0Z" />
      </svg>
    ),
  },
  {
    key: "LEADERSHIP",
    labels: {
      en: {
        name: "LEADERSHIP",
        description: "Shows initiative, confidence, and fair leadership.",
      },
      th: {
        description: "กล้าคิด กล้าทำ กล้าแสดงออก และมีความเป็นธรรม",
        name: "ความเป็นผู้นำที่่ดี",
      },
    },
    circleColor: PALETTE.darkGreen,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={PALETTE.darkGreen}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={cvCommonStyle}
      >
        <path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
        <path d="M8 15H7a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: "COMMUNICATION",
    labels: {
      en: {
        name: "COMMUNICATION",
        description: "Communicates clearly and listens well.",
      },
      th: {
        description: "สื่อสารชัดเจน รับฟังอย่างตั้งใจ และพูดอย่างเป็นมิตร",
        name: "การสื่อสารอย่างมีประสิทธิภาพ",
      },
    },
    circleColor: PALETTE.green5,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={PALETTE.darkGreen}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={cvCommonStyle}
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
        <path d="m22 2-10 10" />
        <path d="m22 2-4 0v4" />
        <path d="m12 8v4h4" />
      </svg>
    ),
  },
  {
    key: "PROFESSIONALISM",
    labels: {
      en: {
        name: "PROFESSIONALISM",
        description: "Has strong expertise and solves problems effectively.",
      },
      th: {
        name: "ความเป็นมืออาชีพ",
        description: "รอบรู้ เชี่ยวชาญในงานของตน แก้ปัญหาได้รวดเร็ว แม่นยำ",
      },
    },
    circleColor: PALETTE.green3,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={PALETTE.darkGreen}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={cvCommonStyle}
      >
        <path d="M12 21v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2" />
        <circle cx="8" cy="7" r="4" />
        <path d="M15 21v-4" />
        <path d="M18 21v-7" />
        <path d="M21 21v-10" />
        <path d="m14 17 8-8" />
        <path d="M18 9h4v4" />
      </svg>
    ),
  },
  {
    key: "INTEGRITY",
    labels: {
      en: {
        name: "INTEGRITY",
        description: "Acts with integrity, responsibility, and punctuality.",
      },
      th: {
        name: "ความซื่อสัตย์",
        description: "ซื่อสัตย์ สุจริต สำนึกรับผิดชอบ และตรงต่อเวลา",
      },
    },
    circleColor: PALETTE.green1,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={PALETTE.darkGreen}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={cvCommonStyle}
      >
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

const CARD_COPY: Record<CardLanguage, {
  tagline: string;
  tagline2: string;
  appreciation: string;
  givenBy: string;
  coreValuesTitle: string;
  thankYou: string;
  date: string;
  footer: [string, string, string];
  footerValues: [string, string, string];
}> = {
  en: {
    tagline: "Thank you for making a difference",
    tagline2: "Thank you for embodying our core values and inspiring your colleagues every day.",
    appreciation: "Your contribution creates a great impact. We and your colleagues appreciate you.",
    givenBy: "Given By",
    // coreValuesTitle: "OUR 5 CORE VALUES",
    coreValuesTitle: "Which core value does your good deed align with?",
    thankYou: "Thank you so much",
    date: "DATE",
    footer: ["Future", "and", "Beyond"],
    footerValues: ["Growing together", "Care for the environment", "Towards sustainability"],
  },
  th: {
    tagline: "ขอบคุณที่คุณ สร้างความแตกต่าง",
    tagline2: "ขอบคุณที่ยึดมั่นในค่านิยมของเรา และเป็นแรงบรรดาลใจให้กับเพื่อนร่วมงานทุกวัน",
    appreciation: "การมีส่วนร่วมของคุณ สร้างผลลัพธ์ที่ยิ่งใหญ่ เราและเพื่อนร่วมงาน ขอชื่นชมคุณ",
    givenBy: "มอบโดย",
    // coreValuesTitle: "ค่านิยมหลัก 5 ข้อของเรา",
    coreValuesTitle: "ความดีของคุณตรงกับค่านิยมข้อไหน",
    thankYou: "ขอบคุณมาก",
    date: "วันที่",
    footer: ["เพื่ออนาคต", "และ", "สิ่งที่ไกลกว่านั้น"],
    footerValues: ["เติบโตด้วยกัน", "ใส่ใจสิ่งแวดล้อม", "มุ่งสู่ความยั่งยืน"],
  },
};

export class RecognitionCardImageRenderer {
  private static getTextFont(cardLanguage: CardLanguage) {
    return cardLanguage === "th" ? "IBMPlexSansThai" : "Roboto";
  }

  private static truncateText(text: string, maxChars: number) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxChars) return normalized;
    return `${normalized.slice(0, Math.max(0, maxChars - 3)).trim()}...`;
  }

  /**
   * Estimates how many wrapped lines a run of text will need inside a box
   * of a given pixel width/font-size, WITHOUT cutting any text off. This is
   * only used to size the canvas tall enough before rendering — the actual
   * line breaks are left to Satori's real text layout (which measures true
   * glyph widths and wraps correctly, including unspaced Thai runs).
   */
  private static estimateLineCount(
    text: string,
    boxWidthPx: number,
    fontSizePx: number,
    avgCharWidthFactor = 0.6
  ): number {
    const normalized = (text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return 1;

    const charsPerLine = Math.max(4, Math.floor(boxWidthPx / (fontSizePx * avgCharWidthFactor)));
    const words = normalized.split(" ");
    let lines = 1;
    let currentLen = 0;

    words.forEach((word) => {
      let remaining = word;
      while (remaining.length > 0) {
        const space = currentLen > 0 ? 1 : 0;
        const capacity = charsPerLine - currentLen - space;
        if (capacity <= 0) {
          lines += 1;
          currentLen = 0;
          continue;
        }
        if (remaining.length <= capacity) {
          currentLen += space + remaining.length;
          remaining = "";
        } else {
          currentLen += space + capacity;
          remaining = remaining.slice(capacity);
          lines += 1;
          currentLen = 0;
        }
      }
    });

    return lines;
  }

  /** Maps whatever labels StarCommentParser produced onto S/T/A/R */
  private static mapSectionsToStar(sections: StarSection[]): Partial<Record<StarKey, string>> {
    const map: Partial<Record<StarKey, string>> = {};
    sections.forEach((section) => {
      const rawLabel = section.label?.trim().toUpperCase() ?? "";
      const firstLetter = rawLabel.charAt(0) as StarKey;
      if (STAR_ORDER.includes(firstLetter)) {
        map[firstLetter] = section.text;
      }
    });
    return map;
  }

  private static renderDiamondLogo() {
    const letters: { char: string; filled: boolean }[] = [
      { char: "T", filled: false },
      { char: "B", filled: true },
      { char: "H", filled: false },
    ];

    return (
      <div style={{ display: "flex", flexShrink: 0 }}>
        {letters.map((l, i) => (
          <div
            key={l.char}
            style={{
              display: "flex",
              width: "52px",
              height: "52px",
              marginLeft: i === 0 ? "0px" : "-9px",
              border: `3px solid ${PALETTE.darkGreen}`,
              backgroundColor: l.filled ? PALETTE.darkGreen : PALETTE.cream,
              transform: "rotate(45deg)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                display: "flex",
                transform: "rotate(-45deg)",
                fontFamily: "Roboto",
                fontWeight: 500,
                fontSize: "18px",
                color: l.filled ? "#ffffff" : PALETTE.darkGreen,
              }}
            >
              {l.char}
            </span>
          </div>
        ))}
      </div>
    );
  }

  private static renderHeader(recognizedByName: string, cardLanguage: CardLanguage) {
    const logoUri = getImageDataUri("logo.png", "image/png");
    const copy = CARD_COPY[cardLanguage];
    const textFont = this.getTextFont(cardLanguage);
    const compact = cardLanguage === "th";

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "22px",
          padding: compact ? "26px 36px 16px" : "26px 36px 18px",
          backgroundImage: `linear-gradient(115deg, ${PALETTE.cream} 0%, ${PALETTE.cream} 52%, ${PALETTE.green1} 58%, ${PALETTE.darkGreen} 100%)`,
        }}
      >
        {logoUri ? (
          <img src={logoUri} style={{ width: compact ? "100px" : "110px", height: compact ? "56px" : "62px", objectFit: "contain", display: "flex", flexShrink: 0 }} />
        ) : (
          this.renderDiamondLogo()
        )}

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span
            style={{
              fontFamily: "Roboto",
              fontWeight: 500,
              fontSize: compact ? "30px" : "32px",
              color: PALETTE.darkGreen,
              letterSpacing: "0.5px",
            }}
          >
            RECOGNITION CARD
          </span>
          <div style={{ display: "flex", flexDirection: "column", margin: "3px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: textFont, fontSize: compact ? "23px" : "24px", fontWeight: 500, color: PALETTE.green2 }}>{copy.tagline}</span>
              <SparkleIcon size={16} color={PALETTE.green2} />
            </div>
            <span
              style={{
                fontFamily: textFont,
                fontSize: "14px",
                fontWeight: 400,
                color: PALETTE.textMuted,
                lineHeight: 1.3,
                marginTop: "2px",
                maxWidth: "560px",
              }}
            >
              {copy.tagline2}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: compact ? "9px 17px" : "10px 18px",
            width: "360px",
            flexShrink: 0,
          }}
        >
          {/* FROM Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: "1px solid #e0e5da", width: "100%" }}>
            <div
              style={{
                display: "flex",
                width: "24px",
                height: "24px",
                borderRadius: "12px",
                backgroundColor: PALETTE.darkGreen,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
                <path fill="#ffffff" d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </div>
            <div className="flex flex-row gap-2 justify-center">
              <span style={{ fontFamily: textFont, fontWeight: 700, fontSize: "18px", color: "#022e10ff", whiteSpace: "nowrap", marginRight: "15px" }}>
                {copy.givenBy}
              </span>
              <span
                style={{
                  fontFamily: "Roboto",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: PALETTE.black,
                  whiteSpace: "nowrap",
                }}
              >
                {this.truncateText(recognizedByName, 20)}
              </span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /**
   * Figures out how much taller than the baseline design the card needs to
   * be so that no comment text is ever clipped or truncated, based on the
   * real pixel widths of the boxes the text will render into.
   */
  private static computeExtraHeight(comment: string): number {
    // Full width now since layout is top-to-bottom
    const boxWidth = CARD_WIDTH - 80 - 56;
    const lines = this.estimateLineCount(comment, boxWidth, 18);
    return Math.max(0, Math.ceil(lines * 18 * 1.65 + 44 - 193));
  }

  private static renderStarRow(letter: StarKey, text: string, cardLanguage: CardLanguage) {
    const meta = STAR_META[letter];
    const displayText = (text || "").replace(/\s+/g, " ").trim();
    const questionFont = this.getTextFont(cardLanguage);

    return (
      <div key={letter} style={{ display: "flex", alignItems: "stretch", minHeight: "60px", width: "100%" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "108px",
            flexShrink: 0,
            borderRadius: "16px",
            backgroundColor: meta.bg,
            gap: "3px",
            padding: "10px 6px",
          }}
        >
          <span style={{ fontFamily: "Roboto", fontSize: "30px", fontWeight: 500, color: "#ffffff", lineHeight: 1 }}>
            {letter}
          </span>
          <div
            style={{
              display: "flex",
              width: "25px",
              height: "25px",
              borderRadius: "14px",
              backgroundColor: "rgba(255,255,255,0.22)",
              alignItems: "center",
              justifyContent: "center",
              margin: "2px 0",
            }}
          >
            <StarIcon letter={letter} />
          </div>
          <span style={{ fontFamily: "Roboto", fontSize: "14px", fontWeight: 500, color: "#ffffff", letterSpacing: "1px" }}>
            {meta.word}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            width: "150px",
            flexShrink: 0,
            alignItems: "center",
            backgroundColor: "#ffffff",
            padding: "0 12px",
            fontFamily: questionFont,
            fontSize: "16px",
            fontWeight: 600,
            color: PALETTE.textDark,
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}
        >
          <span style={{ fontFamily: questionFont, fontSize: "16px", fontWeight: 600, lineHeight: 1.3, wordBreak: "break-word" }}>
            {meta.questions[cardLanguage]}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            backgroundColor: PALETTE.panelBg,
            borderRadius: "8px",
            margin: "6px 0 6px 0",
            padding: "12px 16px",
          }}
        >
          <span
            style={{
              fontFamily: "Roboto",
              fontSize: "14px",
              fontStyle: "normal",
              color: PALETTE.textDark,
              lineHeight: 1.4,
              wordBreak: "break-word",
            }}
          >
            {displayText || " "}
          </span>
        </div>
      </div>
    );
  }

  private static renderFreeformPanel(comment: string, cardLanguage: CardLanguage) {
    const displayText = (comment || "").replace(/\s+/g, " ").trim();
    const commentFont = this.getTextFont(cardLanguage);
    const formalMascotGang = getImageDataUri("formalMascotGang.png", "image/png");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          backgroundColor: "#ffffff",
          border: `1px solid ${PALETTE.dashGray}`,
          borderRadius: "18px",
          position: "relative",
          boxShadow: "0 8px 24px rgba(12,58,34,0.07)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 20px",
            backgroundImage: `linear-gradient(90deg, ${PALETTE.darkGreen}, ${PALETTE.green2})`,
            color: "#ffffff",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px",
          }}
        >
          <div style={{ display: "flex", width: "32px", height: "32px", alignItems: "center", justifyContent: "center", borderRadius: "10px", backgroundColor: "rgba(255,255,255,.16)" }}><SparkleIcon size={18} /></div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ fontFamily: commentFont, fontSize: "24px", fontWeight: 600 }}>{cardLanguage === "th" ? "ข้อความชื่นชม" : "Recognition Message"}</span>
            {/* <span style={{ fontFamily: commentFont, fontSize: "12px", color: "#d7e8d8" }}>{cardLanguage === "th" ? "คำขอบคุณจากใจ" : "A note of appreciation"}</span> */}
          </div>
        </div>

        {formalMascotGang && (
          <img
            src={formalMascotGang}
            style={{
              position: "absolute",
              right: "20px",
              top: "-50px",
              width: "280px",
              height: "105px",
              objectFit: "contain",
              zIndex: 10,
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: "28px 30px",
            backgroundColor: "#fbfcf8",
            borderLeft: `6px solid ${PALETTE.accent}`,
            borderBottomLeftRadius: "18px",
            borderBottomRightRadius: "18px",
          }}
        >
          <span style={{ fontFamily: commentFont, fontSize: "18px", fontWeight: 500, color: PALETTE.textDark, lineHeight: 1.65, textAlign: "center", wordBreak: "break-word", width: "100%" }}>{displayText || " "}</span>
        </div>
      </div>
    );
  }

  private static renderStarSection(comment: string, cardLanguage: CardLanguage) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
        {this.renderFreeformPanel(comment, cardLanguage)}
      </div>
    );
  }

  private static renderBottomStrip(dateString: string, cardLanguage: CardLanguage) {
    const copy = CARD_COPY[cardLanguage];
    const textFont = this.getTextFont(cardLanguage);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: PALETTE.panelBg,
          borderRadius: "8px",
          marginTop: "2px",
          minHeight: "64px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "8px 14px",
            flex: 1,
            borderRight: `1px solid ${PALETTE.dashGray}`,
          }}
        >
          <div
            style={{
              display: "flex",
              width: "32px",
              height: "32px",
              borderRadius: "16px",
              border: `1.5px solid ${PALETTE.green3}`,
              backgroundColor: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={PALETTE.green4}
                stroke={PALETTE.green2}
                strokeWidth={1.5}
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {/* <div style={{ display: "flex", flex: 1, marginRight: "20px" }}> */}
            <span style={{ fontFamily: cardLanguage === "th" ? textFont : "GreatVibes", fontSize: cardLanguage === "th" ? "28px" : "30px", color: PALETTE.green2, fontWeight: 500, lineHeight: 1.1 }}>
              {copy.thankYou}
            </span>
            <span style={{ fontFamily: textFont, fontSize: "14px", color: PALETTE.textMuted, lineHeight: 1.3, marginTop: "2px" }}>
              {copy.appreciation}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "8px 16px", minWidth: "190px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke={PALETTE.textDark} strokeWidth={2} />
              <line x1="16" y1="2" x2="16" y2="6" stroke={PALETTE.textDark} strokeWidth={2} />
              <line x1="8" y1="2" x2="8" y2="6" stroke={PALETTE.textDark} strokeWidth={2} />
              <line x1="3" y1="10" x2="21" y2="10" stroke={PALETTE.textDark} strokeWidth={2} />
            </svg>
            <span style={{ fontFamily: textFont, fontWeight: 500, fontSize: "13px", color: PALETTE.textDark }}>{copy.date}</span>
            <span style={{ fontFamily: "Roboto", fontWeight: 600, fontSize: "13px", color: PALETTE.textDark }}>
              {dateString}
            </span>
          </div>
        </div>
      </div>
    );
  }

  private static renderCoreValues(coreValues: string[], cardLanguage: CardLanguage) {
    const selected = new Set(coreValues.map((v) => v.trim().toUpperCase()));
    const copy = CARD_COPY[cardLanguage];
    const textFont = this.getTextFont(cardLanguage);
    const compact = cardLanguage === "th";

    return (
      <div style={{ display: "flex", width: "100%", gap: "12px", alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "6px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundImage: `linear-gradient(90deg, ${PALETTE.darkGreen}, ${PALETTE.green2})`,
              color: "#ffffffff",
              borderRadius: "30px",
              padding: "6px 12px",
              fontFamily: textFont,
              fontWeight: 500,
              fontSize: "17px",
              letterSpacing: "0.4px",
              alignSelf: "flex-start",
              marginBottom: "5px"
            }}
          >
            <StarBadgeIcon size={12} color="#fbfcf8" />
            <span>{copy.coreValuesTitle}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "row", gap: "8px", flexWrap: "wrap" }}>
            {CORE_VALUES_META.map((cv) => {
              const isChecked = selected.has(cv.key);
              const labels = cv.labels[cardLanguage];
              return (
                <div
                  key={cv.key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px 8px 10px",
                    borderRadius: "12px",
                    backgroundColor: isChecked ? "rgba(242, 255, 247, 1)" : "#fbfcf8",
                    border: isChecked ? `1.5px solid ${PALETTE.green2}` : `1px solid ${PALETTE.dashGray}`,
                    position: "relative",
                    flex: "1 0 0",
                    minWidth: "0",
                    minHeight: "50px",
                    boxShadow: isChecked ? "0 4px 12px rgba(22,92,48,0.04)" : "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      display: "flex",
                    }}
                  >
                    {isChecked ? (
                      <div
                        style={{
                          display: "flex",
                          width: "16px",
                          height: "16px",
                          borderRadius: "8px",
                          backgroundColor: PALETTE.green2,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckIcon size={8} color="#ffffff" strokeWidth={3.5} />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "3px",
                          border: `1.5px solid ${PALETTE.textFaint}`,
                          backgroundColor: "#ffffff",
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "40px",
                      color: PALETTE.darkGreen,
                      marginBottom: "5px",
                    }}
                  >
                    {cv.icon}
                  </div>

                  <span
                    style={{
                      fontFamily: textFont,
                      fontWeight: 600,
                      fontSize: "11.5px",
                      color: PALETTE.darkGreen,
                      textAlign: "center",
                      lineHeight: 1.25,
                      marginTop: "auto",
                    }}
                  >
                    {labels.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  private static renderFooter(cardLanguage: CardLanguage) {
    const copy = CARD_COPY[cardLanguage];
    const textFont = this.getTextFont(cardLanguage);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          backgroundImage: `linear-gradient(90deg, ${PALETTE.darkGreen} 0%, ${PALETTE.green2} 60%, ${PALETTE.green3} 100%)`,
          padding: "12px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {copy.footerValues.map((label, index) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" style={{ width: 28, height: 28 }}>
                {index === 0 && <path d="M4 19c0-3 2.4-5 5.5-5h5c3.1 0 5.5 2 5.5 5M8 7a3 3 0 1 0 0 .1M16 7a3 3 0 1 0 0 .1M9 19l3 2 3-2" fill="none" stroke="#d7dfb0" strokeWidth="1.7" strokeLinecap="round" />}
                {index === 1 && <g><circle cx="12" cy="12" r="9" fill="none" stroke="#d7dfb0" strokeWidth="1.7" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="#d7dfb0" strokeWidth="1.4" /></g>}
                {index === 2 && <path d="M12 21v-9M12 13c-1-5-5-7-9-6 1 5 4 7 9 6Zm0-2c1-5 5-7 9-6-1 5-4 7-9 6ZM6 21h12" fill="none" stroke="#d7dfb0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
              {/* <span style={{ fontFamily: textFont, fontWeight: 500, fontSize: cardLanguage === "th" ? "13px" : "11px", color: "#ffffff", whiteSpace: "nowrap" }}>{label}</span> */}
              <span style={{ fontFamily: textFont, fontWeight: 500, fontSize: "14px", color: "#ffffff", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* <span style={{ fontFamily: textFont, fontWeight: "bold", fontSize: cardLanguage === "th" ? "18px" : "14px", letterSpacing: cardLanguage === "th" ? "0.5px" : "1.5px", color: "#ffffff" }}> */}
          <span style={{ fontFamily: textFont, fontWeight: "bold", fontSize: "14px", letterSpacing: cardLanguage === "th" ? "0.5px" : "1.5px", color: "#ffffff" }}>
            {copy.footer[0]}{" "}
          </span>
          <span style={{ fontFamily: textFont, fontWeight: "bold", fontSize: "14px", letterSpacing: cardLanguage === "th" ? "0.5px" : "1.5px", color: PALETTE.accent }}>
            {copy.footer[1]}{" "}
          </span>
          <span style={{ fontFamily: textFont, fontWeight: "bold", fontSize: "14px", letterSpacing: cardLanguage === "th" ? "0.5px" : "1.5px", color: "#ffffff" }}>
            {copy.footer[2]}
          </span>
        </div>
      </div>
    );
  }

  private static renderImage({ comment, coreValues, cardLanguage, dateString, recognizedByName }: RecognitionCardImageProps) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: PALETTE.cream,
          // borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        {this.renderHeader(recognizedByName, cardLanguage)}

        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "18px 40px", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {this.renderStarSection(comment, cardLanguage)}
          </div>
          <div style={{ display: "flex", borderRadius: "14px", backgroundColor: "#fbfcf8", padding: "10px 16px", boxShadow: "0 6px 18px rgba(12,58,34,.04)" }}>
            {this.renderCoreValues(coreValues, cardLanguage)}
          </div>
          {this.renderBottomStrip(dateString, cardLanguage)}
        </div>

        {this.renderFooter(cardLanguage)}
      </div>
    );
  }

  static async renderToBuffer(props: RecognitionCardImageProps): Promise<Buffer> {
    // Start with a generously sized viewport, then let Chromium measure the
    // actual rendered content. The old estimate was designed for Satori and
    // leaves a large empty area when Chromium wraps Thai text more accurately.
    const initialHeight = CARD_HEIGHT + this.computeExtraHeight(props.comment);
    const markupStream = await renderToReadableStream(this.renderImage(props));
    const markup = await new Response(markupStream).text();
    const fontCss = `
      @font-face { font-family: Roboto; src: url('${getFontDataUri("Roboto-Regular.ttf")}') format('truetype'); font-weight: 400; }
      @font-face { font-family: Roboto; src: url('${getFontDataUri("Roboto-Medium.ttf")}') format('truetype'); font-weight: 500 700; }
      @font-face { font-family: GreatVibes; src: url('${getFontDataUri("GreatVibes-Regular.ttf")}') format('truetype'); font-weight: 400; }
      @font-face { font-family: IBMPlexSansThai; src: url('${getFontDataUri("IBMPlexSansThai-Regular.ttf")}') format('truetype'); font-weight: 400; }
      @font-face { font-family: IBMPlexSansThai; src: url('${getFontDataUri("IBMPlexSansThai-Medium.ttf")}') format('truetype'); font-weight: 500 600; }
      @font-face { font-family: IBMPlexSansThai; src: url('${getFontDataUri("IBMPlexSansThai-Bold.ttf")}') format('truetype'); font-weight: 700; }
      html, body { margin: 0; width: ${CARD_WIDTH}px; height: ${initialHeight}px; overflow: hidden; }
      * { box-sizing: border-box; }
    `;
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: CARD_WIDTH, height: initialHeight, deviceScaleFactor: 2 });
      await page.setContent(
        `<!doctype html><html lang="${props.cardLanguage === "th" ? "th" : "en"}"><head><meta charset="utf-8"><style>${fontCss}</style></head><body>${markup}</body></html>`,
        { waitUntil: "load" }
      );
      await page.evaluate(() => document.fonts.ready);
      const measuredHeight = await page.evaluate(() => {
        const root = document.body.firstElementChild as HTMLElement | null;
        if (!root) return document.body.scrollHeight;

        root.style.height = "auto";
        root.style.overflow = "visible";
        const main = root.children.item(1) as HTMLElement | null;
        if (main) main.style.flex = "none";
        return Math.ceil(root.scrollHeight);
      });
      const cardHeight = Math.max(1, measuredHeight);
      await page.setViewport({ width: CARD_WIDTH, height: cardHeight, deviceScaleFactor: 2 });
      await page.evaluate((height) => {
        document.documentElement.style.height = `${height}px`;
        document.body.style.height = `${height}px`;
        const root = document.body.firstElementChild as HTMLElement | null;
        if (root) {
          root.style.height = `${height}px`;
          root.style.overflow = "hidden";
        }
      }, cardHeight);
      const png = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: CARD_WIDTH, height: cardHeight },
      });
      return Buffer.from(png);
    } finally {
      await browser.close();
    }
  }
}
