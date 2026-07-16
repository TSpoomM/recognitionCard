import { RecognitionCardImageRenderer } from "../app/services/email/RecognitionCardImage";
import fs from "fs";
import path from "path";

async function main() {
  const artifactDir = "C:/Users/Tanapoom/.gemini/antigravity-ide/brain/59055a97-d332-403a-975d-2307899a357e";

  console.log("Rendering Thai card with formal mascot...");
  const bufTh = await RecognitionCardImageRenderer.renderToBuffer({
    recipientName: "John Doe",
    recognizedByName: "Pumin Intarasri",
    comment: "ขอบคุณสำหรับการช่วยเหลือในโปรเจกต์นี้ คุณทำงานได้รวดเร็วและมีประสิทธิภาพมาก คอยช่วยเหลือเพื่อนร่วมงานทุกคนเสมอ!",
    coreValues: ["COMMUNICATION", "PROFESSIONALISM", "INTEGRITY"],
    cardLanguage: "th",
    dateString: "16 กรกฎาคม 2569",
  });
  fs.writeFileSync(path.join(artifactDir, "rendered_card_th_formal.png"), bufTh);
  console.log("Rendered Thai card successfully!");
}

main().catch(console.error);
