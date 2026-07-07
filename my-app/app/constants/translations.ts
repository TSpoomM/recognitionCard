'use client';

export type Language = 'en' | 'th';

export const TRANSLATIONS = {
  en: {
    // Header
    headerLabel: 'Recognition Card',
    headerReport: 'Report',
    headerHistory: 'History',
    headerHome: 'Home',
    headerGuide: 'Guide',

    // Stepper
    stepperTitle: (current: number, total: number) => `Step ${current} of ${total}`,
    stepperDescription: 'Complete each step to submit your recognition card.',
    stepLabels: ['Choose Recipients', 'Select Core Values', 'Write STAR'],

    // Step 1 – User Selection
    step1Title: 'Choose Recipients',
    step1Description: 'Pick one or more teammates to recognize.',
    step1Loading: 'Loading employee data...',
    step1SearchPlaceholder: 'Search by name, team, role...',

    // Step 2 – Core Values
    step2Title: 'Choose types',
    step2Description: 'Select one or more core values that fit.',

    // Step 3 – STAR Comment
    step3Title: 'Write your message',
    step3Description: 'Use the four STAR boxes to structure the note.',
    step3To: 'To',
    step3For: 'For',
    step3Situation: 'Situation',
    step3SituationPlaceholder: 'Describe the situation...',
    step3Task: 'Task',
    step3TaskPlaceholder: 'What was the task?',
    step3Action: 'Action',
    step3ActionPlaceholder: 'What action did you take?',
    step3Result: 'Result',
    step3ResultPlaceholder: 'What was the outcome?',
    step3LengthRequirement: (min: number) => `Minimum ${min} characters`,

    // Form Actions
    back: 'Back',
    continue: 'Continue',
    submitRecognition: 'Submit recognition',

    // Queue Button
    queue: 'Queue',
    queueTitle: 'Recognition queue',
    queueDescription: 'Pending cards auto-confirm after 2 minutes. You can edit, delete, or confirm during that window.',
    queueEmpty: 'Your queue is empty.',
    queueConfirmed: 'Confirmed',
    queueTo: 'To:',
    edit: 'Edit',
    editing: 'Editing',
    delete: 'Delete',
    confirmNow: 'Confirm now',

    // Validation / error messages
    errorNoUserId: 'Current user id is missing. Please open this page from the login system.',
    errorSelectUser: 'Please choose at least one user to comment.',
    errorSelfRecognize: 'You cannot recognize yourself.',
    errorSelectCoreValue: 'Please choose at least one core value.',
    errorCommentTooShort: (length: number) => `Please write at least 70 characters (currently ${length}).`,
    errorCommentTooLong: (length: number) => `Please keep the STAR comment within 500 characters (currently ${length}).`,
    successQueued: 'Recognition card queued successfully.',
    successUpdated: 'Recognition card updated successfully.',
    successSaved: 'Recognition card saved to database.',
    errorLoadUsers: (msg: string) => `Unable to load employee data: ${msg}`,
    errorSaveCard: (msg: string) => `Unable to save recognition card: ${msg}`,
    errorNoUser: 'Please select at least one user.',

    // History Page
    historyTitle: 'History',
    historySubtitle: 'Recognitions you have sent will appear here.',
    historyRecognitionsSent: (count: number) => `${count} recognitions sent`,
    historyFilters: 'Filters',
    historyChooseYear: 'Choose a year to view sent recognitions.',
    historyYear: 'Year',
    historyAllYears: 'All years',
    historyBackButton: 'Back',
    historyLoading: 'Loading history...',
    historyNoRecognitions: 'No recognitions found.',

    // Report Page
    reportTitle: 'Recognition Report',
    reportSubtitle: 'Filter by people, branch, or year, then export PDF or CSV.',
    reportBackButton: 'Back',
    reportCheckingAccess: 'Checking report access...',
    reportAccessDenied: 'Access denied',
    reportOnlyAdmin: 'Only admin users can access the recognition report.',
    reportExportCsv: 'Export CSV',
    reportExportPdf: 'Export PDF',
    reportFilters: 'Filters',
    reportFilterPeople: 'Filter by people',
    reportFilterBranch: 'Filter by branch',
    reportFilterYear: 'Filter by year',
    reportClearFilters: 'Clear filters',
    reportNoFilters: 'No filters applied',
    reportRecognitionCard: 'Recognition Card',

    // Guide Page
    guideBackButton: 'Back',
    guideTitle: 'User Guide',
    guideSubtitle: 'Learn how to use the Recognition Card system step by step.',
    guideIntroTitle: 'What is Recognition Card?',
    guideIntroDesc: 'Recognition Card is a platform that helps you appreciate and recognize your teammates\' contributions through structured STAR feedback. Foster a positive work culture by celebrating achievements, big or small.',
    guideHowToTitle: 'How to Send a Recognition Card',
    guideStep1Title: 'Step 1: Choose Recipients',
    guideStep1Desc: 'Search and select one or more teammates you want to recognize. You can filter by name, team, or role to find the right person quickly.',
    guideStep2Title: 'Step 2: Select Core Values',
    guideStep2Desc: 'Choose the core values that best describe the behavior or achievement you want to highlight. This helps align recognition with company values.',
    guideStep3Title: 'Step 3: Write STAR Message',
    guideStep3Desc: 'Structure your message using the STAR method — Situation, Task, Action, Result. This ensures your recognition is clear, meaningful, and impactful.',
    guideQueueTitle: 'Queue & Confirmation',
    guideQueueDesc: 'After submitting, your card goes to a queue where you can edit, delete, or confirm it within 2 minutes before it\'s automatically sent.',
    guideHistoryTitle: 'View History',
    guideHistoryDesc: 'All recognition cards you\'ve sent are saved in the History page. You can filter by year to review past recognitions.',
    guideStarTitle: 'What is the STAR Method?',
    guideStarSituation: 'Situation: Describe the context or challenge the person faced.',
    guideStarTask: 'Task: Explain the goal or responsibility they had.',
    guideStarAction: 'Action: Highlight the specific actions they took.',
    guideStarResult: 'Result: Share the positive outcome or impact of their actions.',
    guideTipTitle: 'Tips for Great Recognition',
    guideTip1: 'Be specific — mention real events and concrete actions.',
    guideTip2: 'Be timely — recognize achievements soon after they happen.',
    guideTip3: 'Be sincere — write from the heart with genuine appreciation.',
    guideTip4: 'Be inclusive — recognize teammates across all teams and levels.',
    guideGetStarted: 'Ready to recognize your teammates?',
    guideGetStartedBtn: 'Go to Home',
  },

  th: {
    // Header
    headerLabel: 'Recognition Card',
    headerReport: 'รายงาน',
    headerHistory: 'ประวัติ',
    headerHome: 'หน้าหลัก',
    headerGuide: 'คู่มือ',

    // Stepper
    stepperTitle: (current: number, total: number) => `ขั้นตอนที่ ${current} จาก ${total}`,
    stepperDescription: 'ทำแต่ละขั้นตอนให้ครบเพื่อส่ง Recognition Card',
    stepLabels: ['เลือกผู้รับ', 'เลือก Core Values', 'เขียน STAR'],

    // Step 1 – User Selection
    step1Title: 'เลือกผู้รับ',
    step1Description: 'เลือกเพื่อนร่วมทีมอย่างน้อยหนึ่งคนที่ต้องการชื่นชม',
    step1Loading: 'กำลังโหลดข้อมูลพนักงาน...',
    step1SearchPlaceholder: 'ค้นหาด้วยชื่อ, ทีม, ตำแหน่ง...',

    // Step 2 – Core Values
    step2Title: 'เลือกประเภท',
    step2Description: 'เลือก Core Values ที่เหมาะสมอย่างน้อยหนึ่งข้อ',

    // Step 3 – STAR Comment
    step3Title: 'เขียนข้อความ',
    step3Description: 'ใช้กล่อง STAR ทั้งสี่เพื่อจัดโครงสร้างข้อความ',
    step3To: 'ถึง',
    step3For: 'สำหรับ',
    step3Situation: 'สถานการณ์',
    step3SituationPlaceholder: 'อธิบายสถานการณ์...',
    step3Task: 'งาน / เป้าหมาย',
    step3TaskPlaceholder: 'งานหรือเป้าหมายคืออะไร?',
    step3Action: 'การกระทำ',
    step3ActionPlaceholder: 'เขาทำอะไรบ้าง?',
    step3Result: 'ผลลัพธ์',
    step3ResultPlaceholder: 'ผลลัพธ์ที่ได้คืออะไร?',
    step3LengthRequirement: (min: number) => `ขั้นต่ำ ${min} ตัวอักษร`,

    // Form Actions
    back: 'ย้อนกลับ',
    continue: 'ถัดไป',
    submitRecognition: 'ส่ง Recognition',

    // Queue Button
    queue: 'คิว',
    queueTitle: 'คิว Recognition',
    queueDescription: 'การ์ดที่รอดำเนินการจะยืนยันอัตโนมัติหลัง 2 นาที คุณสามารถแก้ไข ลบ หรือยืนยันได้ในช่วงเวลานั้น',
    queueEmpty: 'ไม่มีรายการในคิว',
    queueConfirmed: 'ยืนยันแล้ว',
    queueTo: 'ถึง:',
    edit: 'แก้ไข',
    editing: 'กำลังแก้ไข',
    delete: 'ลบ',
    confirmNow: 'ยืนยันทันที',

    // Validation / error messages
    errorNoUserId: 'ไม่พบ User ID กรุณาเปิดหน้านี้จากระบบล็อกอิน',
    errorSelectUser: 'กรุณาเลือกผู้รับอย่างน้อยหนึ่งคน',
    errorSelfRecognize: 'ไม่สามารถส่ง Recognition ให้ตัวเองได้',
    errorSelectCoreValue: 'กรุณาเลือก Core Value อย่างน้อยหนึ่งข้อ',
    errorCommentTooShort: (length: number) => `กรุณาเขียนอย่างน้อย 70 ตัวอักษร (ปัจจุบัน ${length} ตัว)`,
    errorCommentTooLong: (length: number) => `กรุณาเขียน STAR comment ไม่เกิน 500 ตัวอักษร (ปัจจุบัน ${length} ตัว)`,
    successQueued: 'เพิ่ม Recognition Card เข้าคิวเรียบร้อยแล้ว',
    successUpdated: 'อัปเดต Recognition Card เรียบร้อยแล้ว',
    successSaved: 'บันทึก Recognition Card ลงฐานข้อมูลเรียบร้อยแล้ว',
    errorLoadUsers: (msg: string) => `ไม่สามารถโหลดข้อมูลพนักงาน: ${msg}`,
    errorSaveCard: (msg: string) => `ไม่สามารถบันทึก Recognition Card: ${msg}`,
    errorNoUser: 'กรุณาเลือกผู้รับอย่างน้อยหนึ่งคน',

    // History Page
    historyTitle: 'ประวัติ',
    historySubtitle: 'Recognition ที่คุณส่งจะแสดงที่นี่',
    historyRecognitionsSent: (count: number) => `ส่ง Recognition ${count} รายการ`,
    historyFilters: 'ตัวกรอง',
    historyChooseYear: 'เลือกปีเพื่อดูการส่ง Recognition',
    historyYear: 'ปี',
    historyAllYears: 'ทุกปี',
    historyBackButton: 'ย้อนกลับ',
    historyLoading: 'กำลังโหลดประวัติ...',
    historyNoRecognitions: 'ไม่พบ Recognition',

    // Report Page
    reportTitle: 'รายงาน Recognition',
    reportSubtitle: 'กรองตามคน สาขา หรือปี จากนั้นส่งออก PDF หรือ CSV',
    reportBackButton: 'ย้อนกลับ',
    reportCheckingAccess: 'กำลังตรวจสอบสิทธิ์เข้าถึงรายงาน...',
    reportAccessDenied: 'ปฏิเสธการเข้าถึง',
    reportOnlyAdmin: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงรายงาน Recognition ได้',
    reportExportCsv: 'ส่งออก CSV',
    reportExportPdf: 'ส่งออก PDF',
    reportFilters: 'ตัวกรอง',
    reportFilterPeople: 'กรองตามคน',
    reportFilterBranch: 'กรองตามสาขา',
    reportFilterYear: 'กรองตามปี',
    reportClearFilters: 'ล้างตัวกรอง',
    reportNoFilters: 'ไม่มีการใช้ตัวกรอง',
    reportRecognitionCard: 'Recognition Card',

    // Guide Page
    guideBackButton: 'ย้อนกลับ',
    guideTitle: 'คู่มือการใช้งาน',
    guideSubtitle: 'เรียนรู้วิธีการใช้ระบบ Recognition Card ทีละขั้นตอน',
    guideIntroTitle: 'Recognition Card คืออะไร?',
    guideIntroDesc: 'Recognition Card คือแพลตฟอร์มที่ช่วยให้คุณชื่นชมและยกย่องเพื่อนร่วมทีมผ่านการให้ข้อเสนอแนะแบบ STAR ที่มีโครงสร้าง ส่งเสริมวัฒนธรรมองค์กรเชิงบวกด้วยการเฉลิมฉลองความสำเร็จทั้งเล็กและใหญ่',
    guideHowToTitle: 'วิธีส่ง Recognition Card',
    guideStep1Title: 'ขั้นตอนที่ 1: เลือกผู้รับ',
    guideStep1Desc: 'ค้นหาและเลือกเพื่อนร่วมทีมที่คุณต้องการชื่นชม คุณสามารถกรองตามชื่อ ทีม หรือตำแหน่งเพื่อค้นหาบุคคลที่ต้องการได้อย่างรวดเร็ว',
    guideStep2Title: 'ขั้นตอนที่ 2: เลือก Core Values',
    guideStep2Desc: 'เลือกค่านิยมหลักที่ตรงกับพฤติกรรมหรือความสำเร็จที่คุณต้องการยกย่อง ซึ่งช่วยให้การชื่นชมสอดคล้องกับค่านิยมขององค์กร',
    guideStep3Title: 'ขั้นตอนที่ 3: เขียนข้อความแบบ STAR',
    guideStep3Desc: 'จัดโครงสร้างข้อความของคุณด้วยวิธี STAR — สถานการณ์ งาน การกระทำ ผลลัพธ์ เพื่อให้การชื่นชมของคุณชัดเจน มีความหมาย และมีประสิทธิภาพ',
    guideQueueTitle: 'คิวและการยืนยัน',
    guideQueueDesc: 'หลังจากส่ง การ์ดของคุณจะอยู่ในคิว ซึ่งคุณสามารถแก้ไข ลบ หรือยืนยันได้ภายใน 2 นาทีก่อนที่จะถูกส่งอัตโนมัติ',
    guideHistoryTitle: 'ดูประวัติ',
    guideHistoryDesc: 'การ์ด Recognition ทั้งหมดที่คุณส่งจะถูกบันทึกไว้ในหน้าประวัติ คุณสามารถกรองตามปีเพื่อทบทวนการชื่นชมในอดีต',
    guideStarTitle: 'วิธี STAR คืออะไร?',
    guideStarSituation: 'สถานการณ์: อธิบายบริบทหรือความท้าทายที่บุคคลนั้นเผชิญ',
    guideStarTask: 'งาน: อธิบายเป้าหมายหรือหน้าที่ความรับผิดชอบที่พวกเขามี',
    guideStarAction: 'การกระทำ: ชี้ให้เห็นการกระทำเฉพาะที่พวกเขาทำ',
    guideStarResult: 'ผลลัพธ์: แบ่งปันผลลัพธ์เชิงบวกหรือผลกระทบจากการกระทำของพวกเขา',
    guideTipTitle: 'เคล็ดลับสำหรับการชื่นชมที่มีประสิทธิภาพ',
    guideTip1: 'เฉพาะเจาะจง — พูดถึงเหตุการณ์จริงและการกระทำที่เป็นรูปธรรม',
    guideTip2: 'ทันเวลา — ชื่นชมความสำเร็จไม่นานหลังจากที่เกิดขึ้น',
    guideTip3: 'จริงใจ — เขียนจากใจด้วยความซาบซึ้งอย่างแท้จริง',
    guideTip4: 'ครอบคลุม — ชื่นชมเพื่อนร่วมทีมทุกทีมและทุกระดับ',
    guideGetStarted: 'พร้อมที่จะชื่นชมเพื่อนร่วมทีมของคุณหรือยัง?',
    guideGetStartedBtn: 'ไปที่หน้าหลัก',
  },
};

export type Translations = typeof TRANSLATIONS['en'];