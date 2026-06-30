import fs from "fs";
import path from "path";
import React from "react";
import { ImageResponse } from "next/og";
import { StarCommentParser, StarSection } from "./starComment";

const CARD_WIDTH = 900;
const CARD_HEIGHT = 1200;

const THEME = {
  primary: "#166534",
  primaryLight: "#DCFCE7",
  background: "#F8FAF8",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  title: "#0F172A",
  text: "#334155",
  subtitle: "#64748B",
  divider: "#E2E8F0",
};

const CORE_VALUE_STYLE: Record<
  string,
  { emoji: string; name: string; bgColor: string; textColor: string }
> = {
  RESPECT: {
    emoji: "\u{1F91D}",
    name: "Respect",
    bgColor: "#ecfdf5",
    textColor: "#047857",
  },
  LEADERSHIP: {
    emoji: "\u{1F31F}",
    name: "Leadership",
    bgColor: "#f0f9ff",
    textColor: "#0369a1",
  },
  COMMUNICATION: {
    emoji: "\u{1F4AC}",
    name: "Communication",
    bgColor: "#f5f3ff",
    textColor: "#6d28d9",
  },
  PROFESSIONALISM: {
    emoji: "\u{1F4BC}",
    name: "Professionalism",
    bgColor: "#fffbeb",
    textColor: "#b45309",
  },
  INTEGRITY: {
    emoji: "\u{1F6E1}\uFE0F",
    name: "Integrity",
    bgColor: "#fff1f2",
    textColor: "#be123c",
  },
};

type RecognitionCardImageProps = {
  recipientName: string;
  comment: string;
  coreValues: string[];
  dateString: string;
};

type FittedText = {
  lines: string[];
};

function getFontData(fileName: string): Buffer {
  const filePath = path.join(process.cwd(), "public", "fonts", fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Font file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath);
}

export class RecognitionCardImageRenderer {
  private static truncateText(text: string, maxChars: number) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxChars) return normalized;
    return `${normalized.slice(0, Math.max(0, maxChars - 3)).trim()}...`;
  }

  private static fitText(
    text: string,
    maxChars: number,
    maxLineChars: number,
    maxLines: number
  ): FittedText {
    const normalized = this.truncateText(text, maxChars);

    const words = normalized.split(/\s+/);

    const lines: string[] = [];

    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;

      if (candidate.length <= maxLineChars) {
        current = candidate;
        continue;
      }

      if (current) lines.push(current);

      current = word;
    }

    if (current) lines.push(current);

    if (lines.length > maxLines) {
      const limited = lines.slice(0, maxLines);

      limited[maxLines - 1] =
        limited[maxLines - 1]
          .replace(/[.,;:]?$/, "")
          .trim() + "...";

      return { lines: limited };
    }

    return { lines };
  }

  private static getCommentFontSize(section: StarSection) {
    const len = section.text.length;

    if (len < 90) return 22;

    if (len < 150) return 20;

    if (len < 220) return 18;

    return 17;
  }

  private static renderCoreValues(coreValues: string[]) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          background: THEME.surface,
          border: `1px solid ${THEME.border}`,
          borderRadius: "18px",
          padding: "22px",
        }}
      >
        <span
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: THEME.primary,
            fontFamily: "Roboto",
            marginBottom: "18px",
            letterSpacing: "1px",
          }}
        >
          CORE VALUES
        </span>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {coreValues.map((val) => {
            const meta = CORE_VALUE_STYLE[val.trim().toUpperCase()];

            return (
              <div
                key={val}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: meta?.bgColor || "#F1F5F9",
                  color: meta?.textColor || "#475569",
                  borderRadius: "999px",
                  padding: "10px 18px",
                  fontSize: "18px",
                  fontWeight: 500,
                  fontFamily: "Roboto",
                }}
              >
                <span style={{ marginRight: 8 }}>
                  {meta?.emoji || "✨"}
                </span>

                {meta?.name || val}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  private static renderStarSection(section: StarSection) {
    const fitted = this.fitText(section.text, 320, 64, 4);
    const fontSize = this.getCommentFontSize(section);

    const SECTION_META: Record<
      string,
      {
        title: string;
        color: string;
        bg: string;
      }
    > = {
      S: {
        title: "Situation",
        color: "#0F766E",
        bg: "#ECFDF5",
      },
      T: {
        title: "Task",
        color: "#2563EB",
        bg: "#EFF6FF",
      },
      A: {
        title: "Action",
        color: "#9333EA",
        bg: "#FAF5FF",
      },
      R: {
        title: "Result",
        color: "#EA580C",
        bg: "#FFF7ED",
      },
    };

    const meta =
      SECTION_META[section.label] ?? {
        title: section.label,
        color: "#475569",
        bg: "#F8FAFC",
      };

    return (
      <div
        key={section.label}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          border: `1px solid ${THEME.border}`,
          borderRadius: "18px",
          background: THEME.surface,
          overflow: "hidden",
        }}
      >
        {/* Header */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 22px",
            background: meta.bg,
            borderBottom: `1px solid ${THEME.border}`,
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "21px",
              background: meta.color,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: `${fontSize}px`,
              fontFamily: "Roboto",
              marginRight: "14px",
            }}
          >
            {section.label}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontFamily: "Roboto",
                fontWeight: 700,
                fontSize: "23px",
                color: meta.color,
              }}
            >
              {meta.title}
            </span>

            <span
              style={{
                fontFamily: "Roboto",
                fontSize: "14px",
                color: THEME.subtitle,
              }}
            >
              STAR Framework
            </span>
          </div>
        </div>

        {/* Body */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "22px",
          }}
        >
          {fitted.lines.map((line, i) => (
            <span
              key={i}
              style={{
                fontFamily: "Roboto",
                fontSize: "21px",
                lineHeight: 1.7,
                color: THEME.text,
              }}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    );
  }

  private static renderComment(comment: string) {
    const starSections = StarCommentParser.parse(comment);

    if (starSections.length === 0) {
      const fittedText = this.fitText(comment, 220, 42, 5);

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Roboto",
            // fontSize: fittedText.lines.length > 3 ? "17px" : "20px",
            fontSize: "24px",
            color: "#1e293b",
            lineHeight: 1.8,
            textAlign: "left",
            fontStyle: "italic",
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: "18px",
            padding: "28px",
          }}
        >
          {fittedText.lines.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </div>
      );
    }

    // const maxLinesPerSection = starSections.length >= 4 ? 2 : 3;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: "18px",
        }}
      >
        {starSections.map((section) => this.renderStarSection(section))}
      </div>
    );
  }

  private static renderImage({
    comment,
    coreValues,
    dateString,
    recipientName,
  }: RecognitionCardImageProps) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: THEME.background,
          padding: "48px",
          boxSizing: "border-box",
          fontFamily: "Roboto",
        }}
      >
        {/* Card */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: "#fff",
            borderRadius: "28px",
            border: `1px solid ${THEME.border}`,
            padding: "42px",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "90px",
                borderRadius: "8px",
                background: THEME.primary,
                marginRight: "24px",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  letterSpacing: "4px",
                  color: THEME.subtitle,
                  fontWeight: 500,
                }}
              >
                RECOGNITION CARD
              </span>

              <span
                style={{
                  marginTop: "12px",
                  fontSize:
                    recipientName.length > 30
                      ? "38px"
                      : "46px",
                  color: THEME.title,
                  fontWeight: 700,
                  lineHeight: 1.15,
                }}
              >
                {this.truncateText(recipientName, 42)}
              </span>

              <span
                style={{
                  marginTop: "10px",
                  fontSize: "22px",
                  color: THEME.subtitle,
                }}
              >
                Thank you for your outstanding contribution.
              </span>
            </div>
          </div>

          {/* CORE VALUES */}

          {this.renderCoreValues(coreValues)}

          {/* COMMENT */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              marginTop: "36px",
              marginBottom: "36px",
            }}
          >
            {this.renderComment(comment)}
          </div>

          {/* FOOTER */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderTop: `1px solid ${THEME.border}`,
              paddingTop: "28px",
            }}
          >
            <span
              style={{
                fontFamily: "GreatVibes",
                fontSize: "74px",
                color: THEME.primary,
              }}
            >
              Thank You
            </span>

            <span
              style={{
                marginTop: "12px",
                fontSize: "18px",
                color: THEME.subtitle,
              }}
            >
              Recognized on
            </span>

            <span
              style={{
                marginTop: "6px",
                fontSize: "22px",
                color: THEME.title,
                fontWeight: 500,
              }}
            >
              {dateString}
            </span>
          </div>
        </div>
      </div>
    );
  }

  static async renderToBuffer(props: RecognitionCardImageProps): Promise<Buffer> {
    const imageResponse = new ImageResponse(this.renderImage(props), {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
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
      ],
    });

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}