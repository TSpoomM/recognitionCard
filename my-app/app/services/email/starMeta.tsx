import { CardLanguage } from "../../types/cardLanguage";
import { PALETTE } from "./palette";

export type StarKey = "S" | "T" | "A" | "R";

export const STAR_ORDER: StarKey[] = ["S", "T", "A", "R"];

export const STAR_META: Record<StarKey, { word: string; questions: Record<CardLanguage, string>; bg: string }> = {
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

export function StarIcon({ letter }: { letter: StarKey }) {
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
