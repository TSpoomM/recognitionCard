import { CardLanguage } from "../../types/cardLanguage";
import { PALETTE } from "./palette";

type CoreValueMeta = {
  key: string;
  labels: Record<CardLanguage, { name: string; description: string }>;
  circleColor: string;
  icon: React.ReactNode;
};

const cvCommonStyle = { width: 36, height: 36, overflow: "visible" };

export const CORE_VALUES_META: CoreValueMeta[] = [
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
        <path d="M5 9V5l4-2v4M19 9V5l-4-2v4" />
        <path d="M3 10.5 6.5 9l3 1.5 2-1.2a2.6 2.6 0 0 1 3.1.3l1.1.9 2.3-1 3 1.5-2 6-3.1 1.2" />
        <path d="m8.5 14 4 3.5a1.15 1.15 0 0 0 1.7-1.55M6.5 15.5l3.8 3.4a1.15 1.15 0 0 0 1.7-1.55" />
        <path d="m10.2 11.8 1.2-1a2 2 0 0 1 2.6.05l3.2 2.8" />
        <path d="M3 10.5 5 17l2.2-.7M21 11l-2 6-2-.7" />
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
        <circle cx="10.5" cy="13.5" r="8" />
        <circle cx="10.5" cy="13.5" r="4" />
        <circle cx="10.5" cy="13.5" r="1" />
        <path d="m10.5 13.5 10-10" />
        <path d="M16.5 3.5h4v4" />
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
        <circle cx="6.5" cy="6.5" r="2.8" />
        <path d="M2.5 17.5v-4a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v4M4.5 20v-5M8.5 20v-5" />
        <path d="M12.5 20v-3h2.5v3M16.5 20v-6h2.5v6M20.5 20v-9H23v9" />
        <path d="m12.5 14.5 3.2-3.2 2.2 1.5 4-4" />
        <path d="M19 8.8h3v3" />
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
