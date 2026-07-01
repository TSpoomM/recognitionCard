export type Language = 'en' | 'th';

export const TRANSLATIONS = {
  en: {
    // Header
    headerLabel: 'Recognition Card',
    headerTitle: 'Send Recognition',
    headerReport: 'Report',
    headerHistory: 'History',

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
  },

  th: {
    // Header
    headerLabel: 'Recognition Card',
    headerTitle: 'ส่ง Recognition',
    headerReport: 'รายงาน',
    headerHistory: 'ประวัติ',

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
  },
};

export type Translations = typeof TRANSLATIONS['en'];
