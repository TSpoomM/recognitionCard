import fs from "fs";
import path from "path";
import React from "react";
import { ImageResponse } from "next/og";
import { StarCommentParser, StarSection } from "./starComment";

const CARD_WIDTH = 660;
const CARD_HEIGHT = 860;
const CARD_PADDING_X = 40;
const CARD_PADDING_Y = 36;

/* ══════════════════════════════
   PALETTE — matched to templatePriDew.html
══════════════════════════════ */
const COLORS = {
  bg: "#e8ede9",
  card: "#ffffff",
  accent: "#2d6a4f",
  accentSoft: "#e4f3eb",
  accentSofter: "#f5faf7",
  accentBorder: "#d0e8da",
  line: "#ccddd5",
  lineSoft: "#c0dac9",
  heading: "#1a3828",
  labelMuted: "#6b8c7a",
  labelFaint: "#8aab96",
  body: "#3d5247",
  valueText: "#2d5040",
};

/* ══════════════════════════════
   ICON DEFINITIONS (inline SVG, passthrough to Satori)
══════════════════════════════ */
type IconName =
  | "star"
  | "shieldCheck"
  | "chat"
  | "people"
  | "briefcase"
  | "shield"
  | "heart"
  | "mapPin"
  | "checkCircle"
  | "gear"
  | "trendUp";

function Icon({
  name,
  size = 16,
  color = COLORS.accent,
  filled = false,
}: {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  const strokeProps = filled
    ? { fill: color, stroke: "none" }
    : {
      fill: "none",
      stroke: color,
      strokeWidth: 1.8,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
    };

  switch (name) {
    case "star":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path
            fill={color}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      );
    case "shieldCheck":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path {...strokeProps} d="M9 12l2 2 4-4" />
          <path
            {...strokeProps}
            d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.175 19.29 21 14.591 21 9a12.02 12.02 0 00-.382-3.016z"
          />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path
            {...strokeProps}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      );
    case "people":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path {...strokeProps} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" {...strokeProps} />
          <path {...strokeProps} d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "briefcase":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path {...strokeProps} d="M3 8a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          <path {...strokeProps} d="M8 6V5a2 2 0 012-2h4a2 2 0 012 2v1" />
          <path {...strokeProps} d="M3 13h18" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path {...strokeProps} d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path
            fill={color}
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          />
        </svg>
      );
    case "mapPin":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path {...strokeProps} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" {...strokeProps} />
        </svg>
      );
    case "checkCircle":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path {...strokeProps} d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <path {...strokeProps} d="M22 4L12 14.01L9 11.01" />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" {...strokeProps} />
          <path
            {...strokeProps}
            d="M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93M12 20v2M12 2v2"
          />
        </svg>
      );
    case "trendUp":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path {...strokeProps} d="M23 6L13.5 15.5L8.5 10.5L1 18" />
          <path {...strokeProps} d="M17 6L23 6L23 12" />
        </svg>
      );
    default:
      return null;
  }
}

/* ══════════════════════════════
   CORE VALUE → icon + label lookup
══════════════════════════════ */
const CORE_VALUE_STYLE: Record<string, { icon: IconName; name: string }> = {
  RESPECT: { icon: "shieldCheck", name: "Respect" },
  LEADERSHIP: { icon: "people", name: "Leadership" },
  COMMUNICATION: { icon: "chat", name: "Communication" },
  PROFESSIONALISM: { icon: "briefcase", name: "Professionalism" },
  INTEGRITY: { icon: "shield", name: "Integrity" },
};

function getStarIcon(label: string): IconName {
  const key = (label || "").trim().charAt(0).toUpperCase();
  if (key === "S") return "mapPin";
  if (key === "T") return "checkCircle";
  if (key === "A") return "gear";
  if (key === "R") return "trendUp";
  return "star";
}

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

// Same as getFontData but returns null instead of throwing when the file is
// missing, so an optional font (e.g. a Thai-supporting weight) can be
// skipped gracefully instead of breaking the whole render.
function getFontDataSafe(fileName: string): Buffer | null {
  try {
    return getFontData(fileName);
  } catch {
    return null;
  }
}

export class RecognitionCardImageRenderer {
  private static truncateText(text: string, maxChars: number) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxChars) return normalized;
    return `${normalized.slice(0, Math.max(0, maxChars - 3)).trim()}...`;
  }

  // Wraps text to fit `maxLineChars` per line. No truncation, no "..." —
  // every word in the source text ends up on screen; the caller is
  // responsible for picking a font size that keeps the total line count
  // inside the available height (see pickFontTier).
  private static wrapText(text: string, maxLineChars: number): FittedText {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return { lines: [""] };

    const words = normalized.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if (word.length > maxLineChars) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }

        for (let index = 0; index < word.length; index += maxLineChars) {
          lines.push(word.slice(index, index + maxLineChars));
        }
        return;
      }

      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      if (nextLine.length > maxLineChars) {
        lines.push(currentLine);
        currentLine = word;
        return;
      }

      currentLine = nextLine;
    });

    if (currentLine) lines.push(currentLine);

    return { lines: lines.length > 0 ? lines : [""] };
  }

  // Picks the largest font size (and matching chars-per-line) whose total
  // wrapped line count across all texts stays under the given budget, so
  // long comments shrink to fit instead of getting cut off with "...".
  private static pickFontTier<T extends { fontSize: number; maxLineChars: number }>(
    texts: string[],
    tiers: T[],
    lineBudget: number
  ): T {
    for (const tier of tiers) {
      const totalLines = texts.reduce(
        (sum, text) => sum + this.wrapText(text, tier.maxLineChars).lines.length,
        0
      );
      if (totalLines <= lineBudget) return tier;
    }
    return tiers[tiers.length - 1];
  }

  /* ── CORE VALUES BOX (matches .core-values in template) ── */
  private static renderCoreValues(coreValues: string[]) {
    const dense = coreValues.length > 4;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          backgroundColor: COLORS.accentSofter,
          border: `1px solid ${COLORS.accentBorder}`,
          borderRadius: "10px",
          padding: dense ? "10px 16px" : "12px 18px",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              borderRadius: "17px",
              backgroundColor: COLORS.accent,
              flexShrink: 0,
            }}
          >
            <Icon name="star" size={16} color="#ffffff" filled />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "IBM Plex Sans",
              fontSize: "10px",
              fontWeight: 700,
              color: COLORS.heading,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1.35,
            }}
          >
            <span>Core Values</span>
            <span>Demonstrated</span>
          </div>
        </div>

        <div style={{ width: "1px", height: "32px", backgroundColor: COLORS.lineSoft, flexShrink: 0 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: dense ? "10px" : "14px",
            flex: 1,
            minWidth: 0,
          }}
        >
          {coreValues.map((val) => {
            const cleanVal = val.trim().toUpperCase();
            const meta = CORE_VALUE_STYLE[cleanVal] || { icon: "star" as IconName, name: val };

            return (
              <div
                key={val}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: dense ? "24px" : "28px",
                    height: dense ? "24px" : "28px",
                    borderRadius: "16px",
                    backgroundColor: COLORS.accentSoft,
                    flexShrink: 0,
                  }}
                >
                  <Icon name={meta.icon} size={dense ? 13 : 15} color={COLORS.accent} />
                </div>
                <span
                  style={{
                    fontFamily: "IBM Plex Sans Thai",
                    fontSize: dense ? "12px" : "13px",
                    fontWeight: 500,
                    color: COLORS.valueText,
                  }}
                >
                  {meta.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── ONE STAR ROW (matches .star-row in template) ── */
  private static renderStarSection(
    section: StarSection,
    lines: string[],
    fontSize: number,
    isFirst: boolean
  ) {
    const lineHeight = 1.6;
    const STAR_LABELS: Record<string, string> = {
      S: "Situation",
      T: "Task",
      A: "Action",
      R: "Result",
    };

    return (
      <div
        key={section.label}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          width: "100%",
          gap: "16px",
          padding: "14px 0",
          borderTop: isFirst ? "none" : `1.5px dashed ${COLORS.line}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            backgroundColor: COLORS.accentSoft,
            flexShrink: 0,
          }}
        >
          <Icon name={getStarIcon(section.label)} size={21} color={COLORS.accent} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontFamily: "IBM Plex Sans",
              fontSize: "11px",
              fontWeight: 700,
              color: COLORS.heading,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "4px",
            }}
          >
            {STAR_LABELS[section.label] ?? section.label}
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "IBM Plex Sans Thai",
              fontSize: `${fontSize}px`,
              color: COLORS.body,
              lineHeight,
            }}
          >
            {lines.map((line, lineIndex) => (
              <span key={`${section.label}-${lineIndex}`}>{line}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  private static renderComment(comment: string) {
    const starSections = StarCommentParser.parse(comment);

    // Text-area width available inside a STAR row: card padding, minus
    // the icon column (42px) and its gap (16px) on the left.
    const starTextWidth = CARD_WIDTH - CARD_PADDING_X * 2 - 42 - 16;
    // Text-area width for the no-STAR fallback (full width, centered, no icon).
    const plainTextWidth = CARD_WIDTH - CARD_PADDING_X * 2;
    // Rough average glyph width as a fraction of font size for IBM Plex
    // (mixed Thai/Latin) — used only to estimate chars-per-line, not to
    // measure pixel-exact text.
    const GLYPH_RATIO = 0.56;
    const charsPerLine = (width: number, fontSize: number) => Math.max(8, Math.floor(width / (fontSize * GLYPH_RATIO)));

    if (starSections.length === 0) {
      const tiers = [17, 15.5, 14, 12.5, 11].map((fontSize) => ({
        fontSize,
        maxLineChars: charsPerLine(plainTextWidth, fontSize),
      }));
      // Available vertical room for the paragraph, in lines.
      const lineBudget = 10;
      const tier = this.pickFontTier([comment], tiers, lineBudget);
      const fittedText = this.wrapText(comment, tier.maxLineChars);

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "IBM Plex Sans Thai",
            fontSize: `${tier.fontSize}px`,
            color: COLORS.body,
            lineHeight: 1.65,
            textAlign: "center",
          }}
        >
          {fittedText.lines.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </div>
      );
    }

    const tiers = [14.5, 13.5, 12.5, 11.5, 10.5].map((fontSize) => ({
      fontSize,
      maxLineChars: charsPerLine(starTextWidth, fontSize),
    }));
    // Total lines budget shared across all STAR rows so the whole block
    // fits the fixed-height canvas; shrinks font instead of truncating.
    const lineBudget = 22;
    const tier = this.pickFontTier(
      starSections.map((s) => s.text),
      tiers,
      lineBudget
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {starSections.map((section, index) =>
          this.renderStarSection(
            section,
            this.wrapText(section.text, tier.maxLineChars).lines,
            tier.fontSize,
            index === 0
          )
        )}
      </div>
    );
  }

  private static renderImage({ comment, coreValues, dateString, recipientName }: RecognitionCardImageProps) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: COLORS.card,
          boxSizing: "border-box",
          overflow: "hidden",
          padding: `${CARD_PADDING_Y}px ${CARD_PADDING_X}px`,
        }}
      >
        {/* ── HEADER (accent bar + label + name, matches .card-header) ── */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "stretch", gap: "14px", flexShrink: 0 }}>
          <div style={{ width: "4px", backgroundColor: COLORS.accent, borderRadius: "0 3px 3px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontFamily: "IBM Plex Sans",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.22em",
                color: COLORS.labelMuted,
                textTransform: "uppercase",
                marginBottom: "9px",
              }}
            >
              Recognition Card
            </span>
            <span
              style={{
                fontFamily: "IBM Plex Sans Thai",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: recipientName.length > 24 ? "27px" : "31px",
                color: COLORS.heading,
                lineHeight: 1.15,
              }}
            >
              {this.truncateText(recipientName, 34)}
            </span>
          </div>
        </div>

        {/* ── CORE VALUES ── */}
        <div style={{ display: "flex", width: "100%", margin: "16px 0" }}>{this.renderCoreValues(coreValues)}</div>

        {/* ── STAR SECTIONS / COMMENT (fills remaining space) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            width: "100%",
            overflow: "hidden",
          }}
        >
          {this.renderComment(comment)}
        </div>

        {/* ── FOOTER (matches .card-footer) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: `1.5px solid ${COLORS.line}`,
            paddingTop: "18px",
            marginTop: "10px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "18px",
                backgroundColor: COLORS.accent,
                flexShrink: 0,
              }}
            >
              <Icon name="heart" size={17} color="#ffffff" filled />
            </div>
            <span
              style={{
                fontFamily: "IBM Plex Sans",
                fontSize: "16px",
                fontWeight: 700,
                color: COLORS.heading,
              }}
            >
              Thank you
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span
              style={{
                fontFamily: "IBM Plex Sans",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: COLORS.labelFaint,
                marginBottom: "4px",
              }}
            >
              Sent On
            </span>
            <span
              style={{
                fontFamily: "IBM Plex Sans",
                fontSize: "14px",
                fontWeight: 500,
                color: COLORS.valueText,
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
    // "IBM Plex Sans Thai" / "IBM Plex Sans" are used to match the visual
    // language of templatePriDew.html and to render Thai glyphs correctly
    // (Roboto has no Thai coverage). Drop the .ttf files below into
    // public/fonts — if a weight is missing, it is skipped instead of
    // crashing the render, but Thai text will look off without it.
    const fontCandidates: Array<{ name: string; file: string; style: "normal" | "italic"; weight: 400 | 500 | 700 }> = [
      { name: "IBM Plex Sans Thai", file: "IBMPlexSansThai-Regular.ttf", style: "normal", weight: 400 },
      { name: "IBM Plex Sans Thai", file: "IBMPlexSansThai-Medium.ttf", style: "normal", weight: 500 },
      { name: "IBM Plex Sans Thai", file: "IBMPlexSansThai-Bold.ttf", style: "normal", weight: 700 },
      { name: "IBM Plex Sans", file: "IBMPlexSans-Regular.ttf", style: "normal", weight: 400 },
      { name: "IBM Plex Sans", file: "IBMPlexSans-SemiBold.ttf", style: "normal", weight: 700 },
      { name: "IBM Plex Sans", file: "IBMPlexSans-BoldItalic.ttf", style: "italic", weight: 700 },
    ];

    const fonts = fontCandidates
      .map(({ name, file, style, weight }) => {
        const data = getFontDataSafe(file);
        return data ? { name, data, style, weight } : null;
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);

    // Fallback so the render never crashes even if no Thai font file has
    // been added yet (Latin text will still show, Thai glyphs may be blank).
    if (fonts.length === 0) {
      fonts.push({
        name: "IBM Plex Sans Thai",
        data: getFontData("Roboto-Regular.ttf"),
        style: "normal",
        weight: 400,
      });
    }

    const imageResponse = new ImageResponse(this.renderImage(props), {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      fonts,
    });

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}