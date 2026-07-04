'use client';

import { Component } from "react";
import { LanguageContext } from "../../../context/LanguageContext";

type RecognitionHeaderProps = {
  currentUserId: string;
};

export default class RecognitionHeader extends Component<RecognitionHeaderProps> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  render() {
    const { t } = this.context;

    return (
      <div>
        <p className="mb-5 text-4xl uppercase tracking-[0.2em] text-slate-500">{t.headerLabel}</p>
      </div>
    );
  }
}
