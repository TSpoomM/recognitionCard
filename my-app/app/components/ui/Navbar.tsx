'use client';

import { Component } from "react";
import { buildCurrentUserHref } from "../../lib/currentUser";
import { reportAccessClient } from "../../lib/reportAccessClient";
import { LanguageContext } from "../../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { FileText, Clock } from "lucide-react";

type NavbarProps = {
  currentUserId: string;
};

type NavbarState = {
  isAdmin: boolean;
  isLoadingAccess: boolean;
};

export default class Navbar extends Component<NavbarProps, NavbarState> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  private cancelled = false;

  constructor(props: NavbarProps) {
    super(props);

    this.state = {
      isAdmin: false,
      isLoadingAccess: true,
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
    if (!currentUserId) {
      this.setState({ isLoadingAccess: false });
      return;
    }

    try {
      const access = await reportAccessClient.getAccess(currentUserId);
      if (this.cancelled) return;
      this.setState({ isAdmin: access.isAdmin, isLoadingAccess: false });
    } catch {
      if (this.cancelled) return;
      this.setState({ isLoadingAccess: false });
    }
  }

  render() {
    const { currentUserId } = this.props;
    const { isAdmin } = this.state;
    const { t } = this.context;

    return (
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <a
              href={buildCurrentUserHref("/", currentUserId)}
              className="flex items-center gap-2 text-xl font-bold text-slate-900 transition hover:text-slate-700"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-slate-900" />
              <span className="hidden sm:inline">Recognition</span>
            </a>

            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />

              <a
                href={buildCurrentUserHref("/history", currentUserId)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">{t.headerHistory}</span>
              </a>

              {isAdmin && (
                <a
                  href={buildCurrentUserHref("/report", currentUserId)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-4 text-sm font-semibold text-violet-800 transition hover:border-violet-400 hover:bg-violet-100"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.headerReport}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
