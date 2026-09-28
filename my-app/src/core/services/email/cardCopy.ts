import { CardLanguage } from "../../types/cardLanguage";

export const CARD_COPY: Record<CardLanguage, {
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
