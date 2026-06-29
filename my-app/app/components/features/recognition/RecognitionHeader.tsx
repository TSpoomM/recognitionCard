'use client';

import { Component } from "react";
import { buildCurrentUserHref } from "../../../lib/currentUser";

type RecognitionHeaderProps = {
  currentUserId: string;
};

type RecognitionHeaderState = {
  isAdmin: boolean;
};

export default class RecognitionHeader extends Component<RecognitionHeaderProps, RecognitionHeaderState> {
  private cancelled = false;

  constructor(props: RecognitionHeaderProps) {
    super(props);

    this.state = {
      isAdmin: false,
    };
  }

  componentDidMount() {
    this.loadAdminAccess();
  }

  componentWillUnmount() {
    this.cancelled = true;
  }

  private async loadAdminAccess() {
    const { currentUserId } = this.props;
    if (!currentUserId) return;
    console.log("currentUserId", currentUserId);

    try {
      const response = await fetch(
        `/api/report/access?currentUserId=${encodeURIComponent(currentUserId)}`
      );
      const result = await response.json();
      console.log("result", result);


      if (this.cancelled || !response.ok || !result.success) return;

      this.setState({ isAdmin: Boolean(result.data?.isAdmin) });
    } catch {
      // Ignore header access check errors.
    }
  }

  render() {
    const { currentUserId } = this.props;
    const { isAdmin } = this.state;

    return (
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">Recognition Card</p>
          {JSON.stringify("Admin")}
          {JSON.stringify(isAdmin)}
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <a
              href={buildCurrentUserHref("/report", currentUserId)}
              className="inline-flex h-11 items-center justify-center rounded-3xl border border-violet-300 bg-violet-50 px-5 text-sm font-semibold text-violet-800 transition hover:border-violet-400"
            >
              Report
            </a>
          )}
          <a
            href={buildCurrentUserHref("/history", currentUserId)}
            className="inline-flex h-11 items-center justify-center rounded-3xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
          >
            History
          </a>
        </div>
      </div>
    );
  }
}
