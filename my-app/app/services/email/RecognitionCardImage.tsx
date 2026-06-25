import fs from "fs";
import path from "path";
import React from "react";
import { ImageResponse } from "next/og";
import { StarCommentParser, StarSection } from "./starComment";

const CARD_WIDTH = 600;
const CARD_HEIGHT = 600;

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
    const truncated = this.truncateText(text, maxChars);
    const words = truncated.split(" ");
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

    const limitedLines = lines.slice(0, maxLines);
    if (lines.length > maxLines && limitedLines.length > 0) {
      const lastIndex = limitedLines.length - 1;
      limitedLines[lastIndex] = `${limitedLines[lastIndex].slice(0, Math.max(0, maxLineChars - 3)).trim()}...`;
    }

    return { lines: limitedLines.length > 0 ? limitedLines : [""] };
  }

  private static renderCoreValues(coreValues: string[]) {
    const dense = coreValues.length > 4;

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: dense ? "6px" : "8px",
          justifyContent: "center",
          marginTop: "10px",
          marginBottom: dense ? "4px" : "10px",
          maxHeight: "96px",
          overflow: "hidden",
        }}
      >
        {coreValues.map((val) => {
          const cleanVal = val.trim().toUpperCase();
          const meta = CORE_VALUE_STYLE[cleanVal] || {
            emoji: "\u2728",
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
                justifyContent: "center",
                backgroundColor: meta.bgColor,
                color: meta.textColor,
                padding: dense ? "4px 10px" : "5px 12px",
                borderRadius: "20px",
                fontSize: dense ? "16px" : "18px",
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
    );
  }

  private static renderStarSection(section: StarSection, maxLines: number) {
    const fittedText = this.fitText(section.text, maxLines * 34, 34, maxLines);

    return (
      <div
        key={section.label}
        style={{
          display: "flex",
          alignItems: "flex-start",
          width: "100%",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "34px",
            height: "34px",
            borderRadius: "17px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            fontFamily: "Roboto",
            fontSize: "18px",
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {section.label}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingTop: "2px",
          }}
        >
          <span
            style={{
              fontFamily: "Roboto",
              fontSize: "14px",
              fontWeight: 500,
              color: "#64748b",
              marginBottom: "2px",
            }}
          >
            {section.title}
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Roboto",
              fontSize: maxLines > 2 ? "16px" : "15px",
              color: "#1e293b",
              lineHeight: 1.32,
              fontStyle: "italic",
            }}
          >
            {fittedText.lines.map((line, lineIndex) => (
              <span key={`${section.label}-${lineIndex}`}>{line}</span>
            ))}
          </div>
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
            fontSize: fittedText.lines.length > 3 ? "17px" : "20px",
            color: "#1e293b",
            lineHeight: 1.55,
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {fittedText.lines.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </div>
      );
    }

    const maxLinesPerSection = starSections.length >= 4 ? 2 : 3;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: starSections.length >= 4 ? "7px" : "8px",
          width: "360px",
          maxWidth: "100%",
        }}
      >
        {starSections.map((section) => this.renderStarSection(section, maxLinesPerSection))}
      </div>
    );
  }

  private static renderImage({ comment, coreValues, dateString, recipientName }: RecognitionCardImageProps) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#FAF9F6",
          border: "18px solid #FFFFFF",
          padding: "40px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            flexShrink: 0,
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
              fontSize: recipientName.length > 24 ? "27px" : "32px",
              color: "#334155",
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            For: {this.truncateText(recipientName, 34)}
          </span>
        </div>

        {this.renderCoreValues(coreValues)}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            gap: "8px",
            padding: "0 8px",
            margin: "8px 0",
            width: "100%",
            overflow: "hidden",
          }}
        >
          {this.renderComment(comment)}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "GreatVibes",
              fontSize: "52px",
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            Thank You
          </span>
          <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px", marginBottom: "8px" }}>
            <path
              fill="#ef4444"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
          <span style={{ fontFamily: "Roboto", fontSize: "12px", color: "#94a3b8" }}>
            Sent on {dateString}
          </span>
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
