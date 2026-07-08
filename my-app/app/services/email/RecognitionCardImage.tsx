import fs from "fs";
import path from "path";
import React from "react";
import { ImageResponse } from "next/og";
import { StarCommentParser, StarSection } from "./starComment";
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
      th: "สถานการณ์ หรือบริบท คืออะไร?",
    },
    bg: PALETTE.darkGreen,
  },
  T: {
    word: "TASK",
    questions: {
      en: "What was the task or challenge?",
      th: "งาน หรือความท้าทาย คืออะไร?",
    },
    bg: PALETTE.green1,
  },
  A: {
    word: "ACTION",
    questions: {
      en: "What action did you take?",
      th: "มีการลงมือทำ อะไร?",
    },
    bg: PALETTE.green3,
  },
  R: {
    word: "RESULT",
    questions: {
      en: "What was the result or impact?",
      th: "ผลลัพธ์ หรือผลกระทบ คืออะไร?",
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

const CORE_VALUES_META: CoreValueMeta[] = [
  {
    key: "RESPECT",
    labels: {
      en: {
        name: "RESPECT",
        description: "Respects others and treats everyone equally.",
      },
      th: {
        name: "การให้เกียรติ",
        description: "เคารพผู้อื่นและปฏิบัติต่อทุกคนอย่างเท่าเทียม",
      },
    },
    circleColor: PALETTE.green4,
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
        <path
          fill="#ffffff"
          d="M11 2C6.48 2 2 6.48 2 11s4.48 9 9 9 9-4.48 9-9-4.48-9-9-9zm-1 14H8V8h2v8zm4 0h-2V8h2v8z"
        />
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
        name: "ภาวะผู้นำ",
        description: "แสดงความริเริ่ม ความมั่นใจ และภาวะผู้นำที่เป็นธรรม",
      },
    },
    circleColor: PALETTE.darkGreen,
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
        <path
          fill="#ffffff"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
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
        name: "การสื่อสาร",
        description: "สื่อสารชัดเจนและรับฟังอย่างดี",
      },
    },
    circleColor: PALETTE.green5,
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
        <path
          fill="#ffffff"
          d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"
        />
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
        description: "มีความเชี่ยวชาญสูงและแก้ปัญหาได้อย่างมีประสิทธิภาพ",
      },
    },
    circleColor: PALETTE.green3,
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
        <path
          fill="#ffffff"
          d="M12 2a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"
        />
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
        description: "ปฏิบัติด้วยความซื่อสัตย์ รับผิดชอบ และตรงต่อเวลา",
      },
    },
    circleColor: PALETTE.green1,
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
        <path
          fill="#ffffff"
          d="M12 2L4 5v6c0 5.25 3.5 10.1 8 11.5C16.5 21.1 20 16.25 20 11V5l-8-3zm-1.5 12.5l-3-3 1.4-1.4 1.6 1.6 4.1-4.1 1.4 1.4-5.5 5.5z"
        />
      </svg>
    ),
  },
];

const CARD_COPY: Record<CardLanguage, {
  tagline: string;
  appreciation: string;
  givenBy: string;
  coreValuesTitle: string;
  thankYou: string;
  date: string;
  footer: [string, string, string];
}> = {
  en: {
    tagline: "You make a difference!",
    appreciation: "Thank you for living our values and inspiring others every day.",
    givenBy: "Given By",
    coreValuesTitle: "OUR 5 CORE VALUES",
    thankYou: "Thank you!",
    date: "DATE",
    footer: ["ONE TEAM.", "ONE PURPOSE.", "LIMITLESS IMPACT."],
  },
  th: {
    tagline: "คุณสร้างความแตกต่าง",
    appreciation: "ขอบคุณที่ร่วมส่งต่อคุณค่าของเราและเป็นแรงบันดาลใจให้ผู้อื่น",
    givenBy: "มอบโดย",
    coreValuesTitle: "ค่านิยมหลัก 5 ข้อของเรา",
    thankYou: "ขอบคุณ!",
    date: "วันที่",
    footer: ["หนึ่งทีม", "หนึ่งเป้าหมาย", "สร้างผลลัพธ์ได้ไม่จำกัด"],
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
          padding: compact ? "24px 40px" : "28px 40px",
          backgroundImage: `linear-gradient(115deg, ${PALETTE.cream} 0%, ${PALETTE.cream} 52%, ${PALETTE.green1} 58%, ${PALETTE.darkGreen} 100%)`,
        }}
      >
        {logoUri ? (
          <img src={logoUri} style={{ width: compact ? "116px" : "120px", height: compact ? "66px" : "70px", objectFit: "contain", display: "flex", flexShrink: 0 }} />
        ) : (
          this.renderDiamondLogo()
        )}

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span
            style={{
              fontFamily: "Roboto",
              fontWeight: 500,
              fontSize: compact ? "36px" : "38px",
              color: PALETTE.darkGreen,
              letterSpacing: "0.5px",
            }}
          >
            RECOGNITION CARD
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "3px 0" }}>
            <span style={{ fontFamily: textFont, fontSize: compact ? "23px" : "24px", fontWeight: 500, color: PALETTE.green2 }}>
              {copy.tagline}
            </span>
            <SparkleIcon size={16} color={PALETTE.green2} />
          </div>
          {/* <span style={{ fontFamily: textFont, fontSize: "16px", color: "#4a5a47", fontWeight: 500 }}>
            {copy.appreciation}
          </span> */}
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
            <span style={{ fontFamily: textFont, fontWeight: 700, fontSize: "14px", color: "#022e10ff", whiteSpace: "nowrap" }}>
              {copy.givenBy}
            </span>
            <span
              style={{
                fontFamily: "Roboto",
                fontWeight: 600,
                fontSize: "14px",
                color: PALETTE.black,
                whiteSpace: "nowrap",
              }}
            >
              {this.truncateText(recognizedByName, 20)}
            </span>
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
    const LEFT_COLUMN_WIDTH = CARD_WIDTH - 80 - 380; // outer padding + core-values panel

    const sections = StarCommentParser.parse(comment);
    const map = this.mapSectionsToStar(sections);
    const hasAnyStarText = STAR_ORDER.some((k) => !!map[k]);

    if (!hasAnyStarText) {
      const boxWidth = LEFT_COLUMN_WIDTH - 56; // freeform panel padding (28px x2)
      const lines = this.estimateLineCount(comment, boxWidth, 16);
      const contentHeight = lines * 16 * 1.55 + 44; // line-height + vertical padding
      const baseline = 193;
      return Math.max(0, Math.ceil(contentHeight - baseline));
    }

    const answerBoxWidth = LEFT_COLUMN_WIDTH - 108 - 150 - 32; // badge + question col + padding
    let totalRowsHeight = 0;
    STAR_ORDER.forEach((letter) => {
      const lines = this.estimateLineCount(map[letter] ?? "", answerBoxWidth, 14);
      const contentHeight = lines * 14 * 1.4 + 24; // line-height + vertical padding
      totalRowsHeight += Math.max(88, contentHeight);
    });
    totalRowsHeight += 30; // gaps between the 4 rows

    const baseline = 4 * 88 + 30;
    return Math.max(0, Math.ceil(totalRowsHeight - baseline));
  }

  private static renderStarRow(letter: StarKey, text: string, cardLanguage: CardLanguage) {
    const meta = STAR_META[letter];
    const displayText = (text || "").replace(/\s+/g, " ").trim();
    const questionFont = this.getTextFont(cardLanguage);

    return (
      <div key={letter} style={{ display: "flex", alignItems: "stretch", minHeight: "88px", width: "100%" }}>
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
              width: "28px",
              height: "28px",
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
              fontStyle: "italic",
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

  private static renderFreeformPanel(comment: string) {
    const displayText = (comment || "").replace(/\s+/g, " ").trim();
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          backgroundColor: PALETTE.panelBg,
          borderRadius: "10px",
          padding: "22px 28px",
        }}
      >
        <span
          style={{
            fontFamily: "Roboto",
            fontSize: "16px",
            fontStyle: "italic",
            color: PALETTE.textDark,
            lineHeight: 1.55,
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          {displayText || " "}
        </span>
      </div>
    );
  }

  private static renderStarSection(comment: string, cardLanguage: CardLanguage) {
    const sections = StarCommentParser.parse(comment);
    const map = this.mapSectionsToStar(sections);
    const hasAnyStarText = STAR_ORDER.some((k) => !!map[k]);

    if (!hasAnyStarText) {
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
          {this.renderFreeformPanel(comment)}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
        {STAR_ORDER.map((letter) => this.renderStarRow(letter, map[letter] ?? "", cardLanguage))}
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
          borderRadius: "10px",
          marginTop: "4px",
          minHeight: "76px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "12px 18px",
            flex: 1,
            borderRight: `1px solid ${PALETTE.dashGray}`,
          }}
        >
          <div
            style={{
              display: "flex",
              width: "42px",
              height: "42px",
              borderRadius: "21px",
              border: `2px solid ${PALETTE.green3}`,
              backgroundColor: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={PALETTE.green4}
                stroke={PALETTE.green2}
                strokeWidth={1.5}
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: cardLanguage === "th" ? textFont : "GreatVibes", fontSize: "40px", color: PALETTE.green2, fontWeight: 500 }}>
              {copy.thankYou}
            </span>
            {/* <span style={{ fontFamily: "Roboto", fontSize: "10px", color: PALETTE.textMuted, lineHeight: 1.3 }}>
                            Your contribution makes a real impact.
                        </span> */}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px 20px", minWidth: "230px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke={PALETTE.textDark} strokeWidth={2} />
              <line x1="16" y1="2" x2="16" y2="6" stroke={PALETTE.textDark} strokeWidth={2} />
              <line x1="8" y1="2" x2="8" y2="6" stroke={PALETTE.textDark} strokeWidth={2} />
              <line x1="3" y1="10" x2="21" y2="10" stroke={PALETTE.textDark} strokeWidth={2} />
            </svg>
            <span style={{ fontFamily: textFont, fontWeight: 500, fontSize: "16px", color: PALETTE.textDark }}>{copy.date}</span>
            <span style={{ fontFamily: "Roboto", fontWeight: 600, fontSize: "16px", color: PALETTE.textDark }}>
              {dateString}
            </span>
          </div>
          {/* <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
                            <path
                                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                                fill="none"
                                stroke={PALETTE.textDark}
                                strokeWidth={2}
                            />
                            <path
                                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                fill="none"
                                stroke={PALETTE.textDark}
                                strokeWidth={2}
                            />
                        </svg>
                        <span style={{ fontFamily: "Roboto", fontWeight: 500, fontSize: "11px", color: PALETTE.textDark }}>
                            SIGNATURE
                        </span>
                        <span style={{ fontFamily: "Roboto", fontWeight: 600, fontSize: "11.5px", color: PALETTE.textDark }}>
                            {this.truncateText(recognizedByName, 20)}
                        </span>
                    </div> */}
        </div>
      </div>
    );
  }

  private static renderCoreValues(coreValues: string[], cardLanguage: CardLanguage) {
    const selected = new Set(coreValues.map((v) => v.trim().toUpperCase()));
    const copy = CARD_COPY[cardLanguage];
    const textFont = this.getTextFont(cardLanguage);
    const compact = cardLanguage === "th";
    const mascotUri1 = getImageDataUri("mascot1.png", "image/png");
    const mascotUri2 = getImageDataUri("mascot2.png", "image/png");
    const mascotUri3 = getImageDataUri("mascot3.png", "image/png");
    // const gangMascot = getImageDataUri("theMascotGang.png", "image/png")
    // const gangMascot = getImageDataUri("gangMascot.png", "image/png")
    const gangMascot = getImageDataUri("canvaMascot.png", "image/png")

    return (
      <div style={{ display: "flex", flexDirection: "column", width: "380px", flexShrink: 0, paddingLeft: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundImage: `linear-gradient(90deg, ${PALETTE.darkGreen}, ${PALETTE.green2})`,
            color: "#ffffff",
            borderRadius: "30px",
            padding: compact ? "10px 18px" : "11px 20px",
            fontFamily: textFont,
            fontWeight: 500,
            fontSize: "16px",
            letterSpacing: "0.4px",
            marginBottom: compact ? "6px" : "8px",
          }}
        >
          <StarBadgeIcon size={18} color="#ffffff" />
          <span>{copy.coreValuesTitle}</span>
        </div>
        {/* <span style={{ fontFamily: "Roboto", fontSize: "14px", fontWeight: 600, color: PALETTE.textDark, marginBottom: "8px" }}>
          This recognition demonstrates:
        </span> */}

        {CORE_VALUES_META.map((cv, i) => {
          const isChecked = selected.has(cv.key);
          const labels = cv.labels[cardLanguage];
          return (
            <div
              key={cv.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: compact ? "6px 0" : "9px 0",
                borderBottom: i === CORE_VALUES_META.length - 1 ? "none" : `1px dashed ${PALETTE.dashGray}`,
                width: "100%",
                marginTop: compact ? "1px" : "2px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "42px",
                  height: "42px",
                  borderRadius: "21px",
                  backgroundColor: cv.circleColor,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {cv.icon}
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ fontFamily: textFont, fontWeight: 500, fontSize: "16px", color: PALETTE.darkGreen, wordBreak: "break-word" }}>
                  {labels.name}
                </span>
                <span style={{ fontFamily: textFont, fontWeight: 500, fontSize: compact ? "13.5px" : "12.5px", color: PALETTE.textMuted, lineHeight: compact ? 1.15 : 1.2, wordBreak: "break-word" }}>
                  {labels.description}
                </span>
                {/* <span style={{ fontFamily: "Roboto", fontSize: "14px", color: PALETTE.textMuted, lineHeight: 1.3 }}>
                  {cv.description}
                </span> */}
              </div>
              <div
                style={{
                  display: "flex",
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isChecked ? PALETTE.darkGreen : "#ffffff",
                  border: isChecked ? "none" : `2.5px solid ${PALETTE.lineGray}`,
                }}
              >
                {isChecked && <CheckIcon size={18} color="#ffffff" strokeWidth={3} />}
              </div>
            </div>
          );
        })}

        {mascotUri1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: compact ? "2px" : "5px", width: "100%" }}>
            {/* <img src={mascotUri2} style={{ width: "200px", height: "200px", objectFit: "contain", borderRadius: "10px" }} /> */}
            {/* <img src={mascotUri1} style={{ width: "205px", height: "205px", objectFit: "contain", borderRadius: "10px" }} />
            <img src={mascotUri3} style={{ width: "205px", height: "205px", objectFit: "contain", borderRadius: "10px" }} /> */}
            {/* <img src={gangMascot} style={{ width: "300px", height: "200px", objectFit: "contain", borderRadius: "10px" }} /> */}
            <img src={gangMascot} style={{ width: compact ? "358px" : "360px", height: compact ? "175px" : "180px", objectFit: "contain", borderRadius: "10px" }} />
          </div>
        )}
        {/* <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingLeft: "16px" }}>
          <span style={{ fontFamily: "GreatVibes", fontSize: "40px", color: PALETTE.green2, fontWeight: 500 }}>
            Thank you!
          </span>
        </div> */}
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
          justifyContent: "center",
          width: "100%",
          backgroundImage: `linear-gradient(90deg, ${PALETTE.darkGreen} 0%, ${PALETTE.green2} 60%, ${PALETTE.green3} 100%)`,
          padding: "14px",
        }}
      >
        <span style={{ fontFamily: textFont, fontWeight: 500, fontSize: cardLanguage === "th" ? "13px" : "13.5px", letterSpacing: cardLanguage === "th" ? "0.8px" : "2.5px", color: "#ffffff" }}>
          {copy.footer[0]}{" "}
        </span>
        <span style={{ fontFamily: textFont, fontWeight: 500, fontSize: cardLanguage === "th" ? "13px" : "13.5px", letterSpacing: cardLanguage === "th" ? "0.8px" : "2.5px", color: PALETTE.accent }}>
          {copy.footer[1]}{" "}
        </span>
        <span style={{ fontFamily: textFont, fontWeight: 500, fontSize: cardLanguage === "th" ? "13px" : "13.5px", letterSpacing: cardLanguage === "th" ? "0.8px" : "2.5px", color: "#ffffff" }}>
          {copy.footer[2]}
        </span>
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

        <div style={{ display: "flex", flex: 1, padding: "26px 40px", gap: "0px" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {this.renderStarSection(comment, cardLanguage)}
            {this.renderBottomStrip(dateString, cardLanguage)}
          </div>

          {this.renderCoreValues(coreValues, cardLanguage)}
        </div>

        {this.renderFooter(cardLanguage)}
      </div>
    );
  }

  static async renderToBuffer(props: RecognitionCardImageProps): Promise<Buffer> {
    const cardHeight = CARD_HEIGHT + this.computeExtraHeight(props.comment);
    const imageResponse = new ImageResponse(this.renderImage(props), {
      width: CARD_WIDTH,
      height: cardHeight,
      fonts: [
        {
          name: "Roboto",
          data: getFontData("Roboto-Regular.ttf"),
          style: "normal",
          weight: 400,
        },
        {
          name: "Roboto",
          data: getFontData("Roboto-Medium.ttf"),
          style: "normal",
          weight: 500,
        },
        {
          name: "GreatVibes",
          data: getFontData("GreatVibes-Regular.ttf"),
          style: "normal",
          weight: 400,
        },
        {
          name: "IBMPlexSansThai",
          data: getFontData("IBMPlexSansThai-Regular.ttf"),
          style: "normal",
          weight: 400,
        },
        {
          name: "IBMPlexSansThai",
          data: getFontData("IBMPlexSansThai-Medium.ttf"),
          style: "normal",
          weight: 500,
        },
      ],
    });

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
