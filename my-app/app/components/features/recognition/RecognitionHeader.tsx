'use client';

import Link from "next/link";
import { Component } from "react";

export default class RecognitionHeader extends Component {
  render() {
    return (
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">Recognition Card</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open dashboard
        </Link>
      </div>
    );
  }
}
