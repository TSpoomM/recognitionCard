'use client';

import { Component } from "react";
import { buildCurrentUserHref } from "../../../lib/currentUser";

type RecognitionHeaderProps = {
  currentUserId: string;
};

export default class RecognitionHeader extends Component<RecognitionHeaderProps> {
  render() {
    const { currentUserId } = this.props;

    return (
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">Recognition Card</p>
        </div>
        <a
          href={buildCurrentUserHref("/history", currentUserId)}
          className="inline-flex h-11 items-center justify-center rounded-3xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
        >
          History
        </a>
      </div>
    );
  }
}
