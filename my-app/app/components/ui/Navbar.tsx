'use client';

import { Component } from "react";
import { buildCurrentUserHref } from "../../lib/currentUser";
import { reportAccessClient } from "../../lib/reportAccessClient";
import { LanguageContext } from "../../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { FileText, Clock, House, BookOpen } from "lucide-react";
import Image from "next/image";

type NavbarProps = {
  currentUserId: string;
};

type NavbarState = {
  isAdmin: boolean;
  isLoadingAccess: boolean;
  currentPath: string;
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
      currentPath: "",
    };
  }

  componentDidMount() {
    this.setState({ currentPath: window.location.pathname });
    this.loadAdminAccess();
  }

  componentDidUpdate(prevProps: NavbarProps) {
    if (prevProps.currentUserId !== this.props.currentUserId) {
      this.loadAdminAccess();
    }
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

    this.setState({ isLoadingAccess: true });

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
    const { currentPath, isAdmin } = this.state;
    const { t } = this.context;
    const showReport = isAdmin || currentPath === "/report";
    const getNavItemClassName = (active: boolean, tone: "default" | "report" = "default") => {
      if (active) {
        return tone === "report"
          ? "inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-amber-400 bg-amber-100 px-5 text-base font-bold text-amber-950 shadow-sm shadow-amber-900/10 transition hover:border-amber-400 hover:bg-amber-100"
          : "inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-amber-400 bg-teal-800 px-5 text-base font-bold text-white shadow-sm shadow-teal-900/20 transition hover:bg-teal-900";
      }

      return "inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-amber-300 bg-white/90 px-5 text-base font-semibold text-slate-900 transition hover:border-amber-400 hover:bg-amber-50";
    };

    return (
      <nav className="sticky top-0 z-40 border-b-[1.5px] border-amber-300 bg-white/85 shadow-sm shadow-teal-900/5 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <a
              href={buildCurrentUserHref("/", currentUserId)}
              className="flex items-center gap-3 text-2xl font-bold text-slate-900 transition hover:text-teal-800"
            >
              {/* <Image src="/logo.png" alt="TeckBeeHang" width={50} height={50} priority={true} /> */}
              <Image
                src="/logo.png"
                alt="TeckBeeHang"
                width={50}
                height={51}
                priority
                style={{ width: "50px", height: "auto" }}
              />
              <span className="hidden sm:inline">{t.headerLabel}</span>
            </a>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={buildCurrentUserHref("/", currentUserId)}
                className={getNavItemClassName(currentPath === "/")}
              >
                <House className="h-5 w-5" />
                <span className="hidden sm:inline">{t.headerHome ?? "Home"}</span>
              </a>

              <a
                href={buildCurrentUserHref("/history", currentUserId)}
                className={getNavItemClassName(currentPath === "/history")}
              >
                <Clock className="h-5 w-5" />
                <span className="hidden sm:inline">{t.headerHistory}</span>
              </a>

              <a
                href={buildCurrentUserHref("/guide", currentUserId)}
                className={getNavItemClassName(currentPath === "/guide")}
              >
                <BookOpen className="h-5 w-5" />
                <span className="hidden sm:inline">{t.headerGuide}</span>
              </a>

              {showReport && (
                <a
                  href={buildCurrentUserHref("/report", currentUserId)}
                  className={getNavItemClassName(currentPath === "/report", "report")}
                >
                  <FileText className="h-5 w-5" />
                  <span className="hidden sm:inline">{t.headerReport}</span>
                </a>
              )}

              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
