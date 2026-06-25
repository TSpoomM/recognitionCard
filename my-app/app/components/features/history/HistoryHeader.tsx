'use client';

import { Component } from "react";
import { ArrowLeft, History as HistoryIcon } from "lucide-react";
import { buildCurrentUserHref } from "../../../lib/currentUser";

type HistoryHeaderProps = {
  currentUserId: string;
  totalRecipients: number;
};

export default class HistoryHeader extends Component<HistoryHeaderProps> {
  render() {
    const { currentUserId, totalRecipients } = this.props;

    return (
      <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">Recognition Card</p>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-950">
            <HistoryIcon className="h-8 w-8" />
            History
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {totalRecipients > 0 ? `${totalRecipients} recognitions sent` : "Recognitions you have sent will appear here."}
          </p>
        </div>
        <a
          href={buildCurrentUserHref("/", currentUserId)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-3xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </a>
      </header>
    );
  }
}
