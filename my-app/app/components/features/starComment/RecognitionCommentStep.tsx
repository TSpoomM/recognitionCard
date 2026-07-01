'use client';

import { ChangeEvent, Component } from "react";
import { CommentType, COMMENT_TYPE_META } from "../../../types/commentType";
import { User } from "../../../types/user";
import { LanguageContext } from "../../../context/LanguageContext";

type RecognitionCommentStepProps = {
  users: User[];
  selectedTypes: CommentType[];
  comment: string;
  commentLength: number;
  onCommentChange: (comment: string) => void;
};

type StarSections = {
  s: string;
  t: string;
  a: string;
  r: string;
};

export default class RecognitionCommentStep extends Component<RecognitionCommentStepProps, StarSections> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  constructor(props: RecognitionCommentStepProps) {
    super(props);
    this.state = this.parseComment(props.comment);
  }

  componentDidUpdate(prevProps: RecognitionCommentStepProps) {
    if (prevProps.comment !== this.props.comment) {
      this.setState(this.parseComment(this.props.comment));
    }
  }

  private parseComment(comment: string): StarSections {
    const sections: StarSections = { s: "", t: "", a: "", r: "" };

    if (!comment.trim()) {
      return sections;
    }

    const lines = comment.split(/\n/).map((line) => line.trim());
    const sectionMap: Record<string, keyof StarSections> = {
      S: "s",
      T: "t",
      A: "a",
      R: "r",
    };

    let currentSection: keyof StarSections | null = null;

    lines.forEach((line) => {
      const match = line.match(/^(S|T|A|R)\s*[:\-]?\s*(.*)$/i);

      if (match) {
        const key = sectionMap[match[1].toUpperCase()];
        if (key) {
          sections[key] = match[2].trim();
          currentSection = key;
          return;
        }
      }

      if (currentSection) {
        sections[currentSection] = `${sections[currentSection]}${sections[currentSection] ? "\n" : ""}${line}`.trim();
      }
    });

    if (sections.s || sections.t || sections.a || sections.r) {
      return sections;
    }

    return { ...sections, s: comment.trim() };
  }

  private buildComment(sections: StarSections) {
    const parts = [
      sections.s ? `S: ${sections.s}` : "",
      sections.t ? `T: ${sections.t}` : "",
      sections.a ? `A: ${sections.a}` : "",
      sections.r ? `R: ${sections.r}` : "",
    ].filter(Boolean);

    return parts.join("\n\n");
  }

  private handleChange = (section: keyof StarSections) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextSections = { ...this.state, [section]: event.target.value };
    this.setState(nextSections);
    this.props.onCommentChange(this.buildComment(nextSections));
  };

  render() {
    const { users, selectedTypes, commentLength } = this.props;
    const { t, lang } = this.context;

    const starSections = [
      { key: "s" as const, label: "S", title: t.step3Situation, placeholder: t.step3SituationPlaceholder },
      { key: "t" as const, label: "T", title: t.step3Task, placeholder: t.step3TaskPlaceholder },
      { key: "a" as const, label: "A", title: t.step3Action, placeholder: t.step3ActionPlaceholder },
      { key: "r" as const, label: "R", title: t.step3Result, placeholder: t.step3ResultPlaceholder },
    ];

    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-950 text-white">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 5h14v12H8l-3 3V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="m9 11 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{t.step3Title}</h2>
            <p className="mt-1 text-base text-slate-600">{t.step3Description}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2 text-base text-slate-600">
            <span className="font-medium">{t.step3To}</span>
            {users.map((user) => (
              <span key={user.user_id} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                {user.firstName} {user.lastName}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-base text-slate-600">
            <span className="font-medium">{t.step3For}</span>
            {selectedTypes.map((type) => {
              const meta = COMMENT_TYPE_META[type];
              return (
                <span key={type} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${meta.tint}`}>
                  {meta.emoji} {meta[lang]}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-4 lg:grid-cols-2">
          {starSections.map((section) => (
            <div key={section.key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-base font-semibold text-white">
                  {section.label}
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-900">{section.title}</p>
                  <p className="text-sm text-slate-500">{section.placeholder}</p>
                </div>
              </div>
              <textarea
                value={this.state[section.key]}
                onChange={this.handleChange(section.key)}
                rows={5}
                placeholder={section.placeholder}
                className="min-h-[150px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-lg text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-end gap-3 text-sm text-slate-500">
          <span>{commentLength}/500</span>
        </div>
      </div>
    );
  }
}
