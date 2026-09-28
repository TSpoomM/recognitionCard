'use client';

import { ChangeEvent, Component } from "react";
import { LanguageContext } from "../../../context/LanguageContext";
import { COMMENT_TYPE_META, CommentType } from "../../../core/types/commentType";
import { User } from "../../../core/types/user";

export type StarSections = { s: string; t: string; a: string; r: string };
type Props = {
  users: User[]; selectedTypes: CommentType[]; comment: string; sections: StarSections;
  commentLength: number; minLength: number; sectionMinLength: number; maxLength: number;
  previewConfirmed: boolean; onCommentChange: (value: string) => void;
  onSectionsChange: (value: StarSections) => void; onPreviewConfirmed: () => void; onEditStar: () => void;
};

export default class RecognitionCommentStep extends Component<Props> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  private switchToPreview = () => {
    const preview = Object.values(this.props.sections).map(value => value.trim()).filter(Boolean).join(" ");
    this.props.onCommentChange(preview);
    this.props.onPreviewConfirmed();
  };

  private changeSection = (key: keyof StarSections) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const sections = { ...this.props.sections, [key]: event.target.value };
    if (Object.values(sections).reduce((sum, value) => sum + value.trim().length, 0) <= this.props.maxLength) {
      this.props.onSectionsChange(sections);
      if (!this.props.previewConfirmed) {
        const preview = Object.values(sections).map(value => value.trim()).filter(Boolean).join(" ");
        this.props.onCommentChange(preview);
      }
    }
  };

  render() {
    const { users, selectedTypes, sections, comment, commentLength, minLength, sectionMinLength, maxLength, previewConfirmed } = this.props;
    const { t, lang } = this.context;
    const items = [
      { key: "s" as const, label: "S", title: t.step3Situation, placeholder: t.step3SituationPlaceholder },
      { key: "t" as const, label: "T", title: t.step3Task, placeholder: t.step3TaskPlaceholder },
      { key: "a" as const, label: "A", title: t.step3Action, placeholder: t.step3ActionPlaceholder },
      { key: "r" as const, label: "R", title: t.step3Result, placeholder: t.step3ResultPlaceholder },
    ];
    const minLabel = lang === "th" ? `ขั้นต่ำ ${sectionMinLength} ตัวอักษร` : `Min ${sectionMinLength} characters`;

    return <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-2xl text-white shadow-lg shadow-teal-900/15">★</div>
        <div><p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-teal-700">Step 3</p><h2 className="text-2xl font-bold text-slate-950">{t.step3Title}</h2><p className="mt-1 text-base leading-7 text-slate-600">{t.step3Description}</p></div>
      </div>

      <div className="rounded-2xl border border-amber-300 bg-teal-50/50 p-4">
        <div className="flex flex-wrap items-center gap-2 text-slate-600"><span className="font-medium">{t.step3To}</span>{users.map(user => <span key={user.user_id} className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">{user.firstName} {user.lastName}</span>)}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-slate-600"><span className="font-medium">{t.step3For}</span>{selectedTypes.map(type => { const meta = COMMENT_TYPE_META[type]; return <span key={type} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${meta.tint}`}>{meta.emoji} {meta[lang]}</span>; })}</div>
      </div>

      <div className="sticky top-20 z-30 mt-6 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-lg shadow-slate-900/10 backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto grid max-w-xl grid-cols-2 rounded-xl bg-slate-100 p-1.5" role="group" aria-label="Editing mode">
          <button type="button" onClick={this.props.onEditStar} className={`rounded-lg px-5 py-3 text-sm font-bold transition-all ${!previewConfirmed ? "bg-white text-teal-900 shadow-sm ring-1 ring-amber-300" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}><span className="mr-2">★</span>{lang === "th" ? "เขียน STAR" : "Write STAR"}</button>
          <button type="button" onClick={this.switchToPreview} className={`rounded-lg px-5 py-3 text-sm font-bold transition-all ${previewConfirmed ? "bg-teal-800 text-white shadow-md shadow-teal-900/15" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}><span className="mr-2">✎</span>{lang === "th" ? "แก้ไขตัวอย่าง" : "Edit Preview"}</button>
        </div>
        <p className="mt-2 text-center text-sm font-medium text-slate-500">{previewConfirmed ? (lang === "th" ? "กำลังแก้ข้อความตัวอย่าง" : "Currently editing the preview") : (lang === "th" ? "กำลังกรอกข้อมูล STAR" : "Currently writing STAR details")}</p>
      </div>

      <div className="mt-5 space-y-5">
        <section className={`overflow-hidden rounded-3xl border transition-all ${previewConfirmed ? "border-slate-200 bg-slate-50" : "border-amber-300 bg-white shadow-lg shadow-amber-900/5 ring-1 ring-amber-100"}`}><div className={`flex items-center justify-between border-b px-5 py-4 ${previewConfirmed ? "border-slate-200 bg-slate-100" : "border-amber-200 bg-gradient-to-r from-amber-50 to-white"}`}><div><h3 className="text-lg font-bold text-slate-900">STAR</h3><p className="text-sm text-slate-500">{lang === "th" ? "กรอกข้อมูลให้ครบทั้ง 4 ส่วน" : "Complete all four sections"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${previewConfirmed ? "bg-slate-200 text-slate-500" : "bg-amber-200 text-amber-900"}`}>{previewConfirmed ? (lang === "th" ? "ล็อก" : "LOCKED") : (lang === "th" ? "กำลังเขียน" : "EDITING")}</span></div><div className={`grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 ${previewConfirmed ? "opacity-65" : ""}`}>
          {items.map(item => {
            const length = sections[item.key].trim().length; return <div key={item.key} className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="mb-2 flex items-start gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-800 font-semibold text-white">{item.label}</span><div><p className="font-semibold text-slate-900">{item.title}</p><p className="text-sm text-slate-500">{item.placeholder}</p></div></div>
              <textarea disabled={previewConfirmed} value={sections[item.key]} onChange={this.changeSection(item.key)} rows={4} placeholder={item.placeholder} className="min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-base leading-6 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100" />
              <div className="mt-2 flex justify-between text-xs"><span className={length < sectionMinLength ? "text-amber-600" : "text-emerald-700"}>{minLabel}</span><span>{length}</span></div>
            </div>;
          })}
        </div></section>

        <aside className={`overflow-hidden rounded-3xl border transition-all ${previewConfirmed ? "border-teal-300 bg-white shadow-lg shadow-teal-900/10 ring-1 ring-teal-100" : "border-slate-200 bg-slate-50"}`}>
          <div className={`flex items-center justify-between px-5 py-4 ${previewConfirmed ? "bg-gradient-to-r from-teal-800 to-teal-700 text-white" : "border-b border-slate-200 bg-slate-100 text-slate-700"}`}><div><p className="text-lg font-bold">{lang === "th" ? "ข้อความตัวอย่าง" : "Message preview"}</p><p className={`text-sm ${previewConfirmed ? "text-teal-100" : "text-slate-500"}`}>{previewConfirmed ? (lang === "th" ? "แก้ข้อความได้ โดยไม่กระทบ STAR" : "Edit without changing STAR") : (lang === "th" ? "เลือกโหมด ตัวอย่าง เพื่อแก้ข้อความ" : "Select Preview mode to edit")}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${previewConfirmed ? "bg-white/15 text-white" : "bg-slate-200 text-slate-500"}`}>{previewConfirmed ? (lang === "th" ? "กำลังแก้" : "EDITING") : (lang === "th" ? "ล็อก" : "LOCKED")}</span></div>
          <div className="p-5"><textarea disabled={!previewConfirmed} value={comment} onChange={event => this.props.onCommentChange(event.target.value.slice(0, maxLength))} rows={8} className="w-full rounded-2xl border border-teal-200 bg-teal-50/30 p-4 text-base leading-7 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100" />
            <div className="mt-3 flex justify-between text-sm"><span className={commentLength < minLength ? "text-amber-600" : "text-emerald-700"}>{t.step3LengthRequirement(minLength)}</span><span>{commentLength}/{maxLength}</span></div>
          </div>
        </aside>
      </div>
    </div>;
  }
}
