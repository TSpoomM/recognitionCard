'use client';

import { Component } from "react";
import { History as HistoryIcon } from "lucide-react";
import { LanguageContext } from "../../../context/LanguageContext";

type HistoryHeaderProps = {
  totalRecipients: number;
};

export default class HistoryHeader extends Component<HistoryHeaderProps> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  render() {
    const { totalRecipients } = this.props;
    const { t } = this.context;

    return (
      <header className="mb-8 flex flex-col gap-4 border-b-[1.5px] border-amber-300 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xl uppercase tracking-[0.2em] text-teal-800">{t.reportRecognitionCard}</p>
          <h1 className="flex items-center gap-3 text-4xl font-bold text-slate-950">
            <HistoryIcon className="h-9 w-9 text-teal-800" />
            {t.historyTitle}
          </h1>
          <p className="mt-2 text-base text-slate-600">
            {totalRecipients > 0 ? t.historyRecognitionsSent(totalRecipients) : t.historySubtitle}
          </p>
        </div>
      </header>
    );
  }
}
