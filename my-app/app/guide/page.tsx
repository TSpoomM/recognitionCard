'use client';

import { Component, ReactNode } from "react";
import { LanguageContext, getInitialLanguage } from "../context/LanguageContext";
import { TRANSLATIONS, Language } from "../constants/translations";
import { buildCurrentUserHref, getClientCurrentUserId } from "../lib/currentUser";
import { reportAccessClient } from "../lib/reportAccessClient";
import { logRecognitionAction } from "../lib/recognitionLog";
import { COMMENT_TYPE_META, COMMENT_TYPES } from "../types/commentType";
import Navbar from "../components/ui/Navbar";
import { Users, Heart, MessageSquare, Languages, Clock, History, Star, Lightbulb, Sparkles, CheckCircle, ArrowRight, BarChart3, MousePointerClick, Send, Filter, Download, Search, Pencil, Trash2, X, CalendarDays, FileText } from "lucide-react";

type GuideState = {
  lang: Language;
  currentUserId: string;
  isAdmin: boolean;
  activeGuideSection: string;
  demoCardLanguage: Language;
};

export default class GuidePage extends Component<Record<string, never>, GuideState> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      lang: 'th',
      currentUserId: "",
      isAdmin: false,
      activeGuideSection: "recognition-card",
      demoCardLanguage: "th",
    };
  }

  componentDidMount() {
    const currentUserId = getClientCurrentUserId();
    this.setState({
      lang: getInitialLanguage(),
      currentUserId,
    });
    logRecognitionAction("GuidePage", currentUserId);
    this.loadAdminAccess(currentUserId);
    this.updateActiveGuideSection();
    window.addEventListener("scroll", this.updateActiveGuideSection, { passive: true });
    window.addEventListener("resize", this.updateActiveGuideSection);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.updateActiveGuideSection);
    window.removeEventListener("resize", this.updateActiveGuideSection);
  }

  private handleSetLang = (lang: Language) => {
    this.setState({ lang });
  };

  private async loadAdminAccess(currentUserId: string) {
    if (!currentUserId) return;

    try {
      const access = await reportAccessClient.getAccess(currentUserId);
      this.setState({ isAdmin: access.isAdmin });
    } catch {
      this.setState({ isAdmin: false });
    }
  }

  private updateActiveGuideSection = () => {
    const guideSectionIds = ["recognition-card", "core-value", "star-method", "how-to", "where-to-click"];
    const activeId = guideSectionIds.reduce((currentActiveId, sectionId) => {
      const element = document.getElementById(sectionId);
      if (!element) return currentActiveId;
      return element.getBoundingClientRect().top <= 150 ? sectionId : currentActiveId;
    }, guideSectionIds[0]);

    if (activeId !== this.state.activeGuideSection) {
      this.setState({ activeGuideSection: activeId });
    }
  };

  private scrollToGuideSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  private handleDemoCardLanguage = (demoCardLanguage: Language) => {
    this.setState({ demoCardLanguage });
  };

  render() {
    const { lang, currentUserId, isAdmin, activeGuideSection, demoCardLanguage } = this.state;
    const t = TRANSLATIONS[lang];
    const updatedHomeWalkthroughItems = lang === "th" ? [
      "กด Home ที่เมนูด้านบน หรือกดปุ่มไปหน้าหลักที่ด้านล่างของคู่มือนี้",
      "ขั้นตอนที่ 1 เลือกสาขาหรือค้นหาชื่อ แล้วกดการ์ดเพื่อนร่วมทีมที่ต้องการชื่นชม",
      "กด Continue แล้วเลือกค่านิยมอย่างน้อย 1 ข้อในขั้นตอนที่ 2",
      "ขั้นตอนที่ 3 กรอก Situation, Task, Action และ Result โดย ตัวอย่าง ด้านขวาจะรวมข้อความให้แบบเรียลไทม์",
      "ใช้ปุ่ม เขียน STAR / แก้ ตัวอย่าง ที่ลอยอยู่ด้านบนเพื่อสลับโหมด เมื่อเข้าโหมด ตัวอย่าง ระบบจะนำ STAR ล่าสุดมาสร้างข้อความใหม่ และสามารถปรับสำนวนได้โดยไม่แก้ข้อมูล STAR",
      "ตรวจความยาวและข้อมูลให้ครบ จากนั้นกด Continue",
      "ขั้นตอนที่ 4 เลือกภาษาไทยหรืออังกฤษสำหรับรูปการ์ด แล้วกดส่งคำชื่นชม",
    ] : [
      "Click Home in the top menu, or use the Go to Home button at the bottom of this guide.",
      "In Step 1, choose a branch or search for a name, then select the teammates you want to recognize.",
      "Click Continue and select at least one Core Value in Step 2.",
      "In Step 3, complete Situation, Task, Action, and Result. The Preview on the right combines your STAR text in real time.",
      "Use the sticky Write STAR / Edit Preview switch. Opening Preview rebuilds it from the latest STAR text, then lets you refine the wording without changing STAR.",
      "Check the requirements, then click Continue.",
      "In Step 4, choose Thai or English for the card image, then submit the recognition.",
    ];

    const steps = [
      {
        icon: <Users className="h-8 w-8" />,
        title: t.guideStep1Title,
        desc: t.guideStep1Desc,
        color: "from-teal-400 to-emerald-500",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
        iconBg: "bg-teal-100",
        iconColor: "text-teal-600",
      },
      {
        icon: <Heart className="h-8 w-8" />,
        title: t.guideStep2Title,
        desc: t.guideStep2Desc,
        color: "from-rose-400 to-pink-500",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-200",
        iconBg: "bg-rose-100",
        iconColor: "text-rose-600",
      },
      {
        icon: <MessageSquare className="h-8 w-8" />,
        title: t.guideStep3Title,
        desc: lang === "th"
          ? "กรอก STAR ทั้ง 4 ส่วนที่เรียงลงมา ตัวอย่าง จะอัปเดตแบบเรียลไทม์ จากนั้นสลับไปโหมดแก้ ตัวอย่าง เพื่อปรับสำนวนโดยไม่กระทบข้อมูล STAR"
          : "Complete the four vertically arranged STAR sections. Preview updates in real time; switch to Edit Preview to refine the final message without changing STAR.",
        color: "from-amber-400 to-orange-500",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
      {
        icon: <Languages className="h-8 w-8" />,
        title: t.guideStep4Title,
        desc: lang === "th"
          ? "เลือกภาษาไทยหรืออังกฤษสำหรับรูปการ์ดและข้อความประกอบในอีเมล ภาษาในหน้าเว็บไม่จำเป็นต้องเหมือนกับภาษาของการ์ด"
          : "Choose Thai or English for the card image and its email copy. The interface language and card language can be different.",
        color: "from-sky-400 to-cyan-500",
        bgColor: "bg-sky-50",
        borderColor: "border-sky-200",
        iconBg: "bg-sky-100",
        iconColor: "text-sky-600",
      },
    ];

    const queueStep = {
      icon: <Clock className="h-8 w-8" />,
      title: t.guideQueueTitle,
      desc: t.guideQueueDesc,
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    };
    const historyStep = {
      icon: <History className="h-8 w-8" />,
      title: t.guideHistoryTitle,
      desc: t.guideHistoryDesc,
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    };
    const reportStep = {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t.guideReportTitle,
      desc: t.guideReportDesc,
      borderColor: "border-cyan-200",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    };
    const renderExtraStep = (step: typeof queueStep, className = "") => (
      <div
        className={`app-surface rounded-xl p-6 sm:p-8 border-l-4 ${step.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}
      >
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${step.iconBg} ${step.iconColor} mb-5`}>
          {step.icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
        <p className="text-slate-600 leading-7 text-base">{step.desc}</p>
      </div>
    );

    const starItems = [
      { label: "S", title: t.guideStarSituation, color: "text-teal-600", bg: "bg-teal-100" },
      { label: "T", title: t.guideStarTask, color: "text-amber-600", bg: "bg-amber-100" },
      { label: "A", title: t.guideStarAction, color: "text-rose-600", bg: "bg-rose-100" },
      { label: "R", title: t.guideStarResult, color: "text-blue-600", bg: "bg-blue-100" },
    ];

    const coreValueDescriptions = t.guideCoreValueDescriptions;
    const coreValueItems = COMMENT_TYPES.map((type) => ({
      type,
      label: lang === "th" ? COMMENT_TYPE_META[type].th : COMMENT_TYPE_META[type].en,
      description: coreValueDescriptions[type],
      tint: COMMENT_TYPE_META[type].tint,
    }));

    const tips = [
      { icon: <CheckCircle className="h-5 w-5" />, text: t.guideTip1 },
      { icon: <CheckCircle className="h-5 w-5" />, text: t.guideTip2 },
      { icon: <CheckCircle className="h-5 w-5" />, text: t.guideTip3 },
      { icon: <CheckCircle className="h-5 w-5" />, text: t.guideTip4 },
    ];

    const demoButton = (label: string, className: string, icon?: ReactNode) => (
      <button
        type="button"
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-base font-semibold transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${className}`}
      >
        {icon}
        {label}
      </button>
    );
    const demoIconButton = (label: string, className: string, icon: ReactNode) => (
      <button
        type="button"
        aria-label={label}
        title={label}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] ${className}`}
      >
        {icon}
      </button>
    );

    const walkthroughSections = [
      {
        icon: <MousePointerClick className="h-6 w-6" />,
        title: t.guideWalkthroughHomeTitle,
        items: updatedHomeWalkthroughItems,
        iconBg: "bg-teal-100",
        iconColor: "text-teal-700",
        borderColor: "border-teal-200",
        demo: (
          <div className="flex flex-wrap items-center gap-3">
            {demoButton(t.back, "border-[1.5px] border-amber-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50")}
            {demoButton(t.continue, "bg-teal-800 text-white shadow-sm shadow-teal-900/25 hover:bg-teal-900", <ArrowRight className="h-4 w-4" />)}
            {demoButton(t.submitRecognition, "bg-teal-800 text-white shadow-sm shadow-teal-900/25 hover:bg-teal-900", <Send className="h-4 w-4" />)}
            <span className="inline-grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <span className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-teal-900 shadow-sm">★ {lang === "th" ? "เขียน STAR" : "Write STAR"}</span>
              <span className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500">✎ {lang === "th" ? "แก้ไขตัวอย่าง" : "Edit Preview"}</span>
            </span>
            <span className="inline-flex overflow-hidden rounded-full border-[1.5px] border-amber-300 bg-teal-50 p-1">
              <button
                type="button"
                onClick={() => this.handleDemoCardLanguage("en")}
                className={`rounded-full px-4 py-2 text-sm font-bold transition active:scale-[0.98] ${demoCardLanguage === "en" ? "bg-teal-800 text-white" : "text-slate-500 hover:bg-white"}`}
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => this.handleDemoCardLanguage("th")}
                className={`rounded-full px-4 py-2 text-sm font-bold transition active:scale-[0.98] ${demoCardLanguage === "th" ? "bg-teal-800 text-white" : "text-slate-500 hover:bg-white"}`}
              >
                EN
              </button>
            </span>
          </div>
        ),
      },
      {
        icon: <Send className="h-6 w-6" />,
        title: t.guideWalkthroughQueueTitle,
        items: t.guideWalkthroughQueueItems,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-700",
        borderColor: "border-blue-200",
        demo: (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {demoButton(t.queue, "rounded-full bg-teal-800 px-5 text-white shadow-lg shadow-teal-900/25 hover:bg-teal-900", <Send className="h-4 w-4" />)}
              {demoButton(t.edit, "border-[1.5px] border-amber-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50", <Pencil className="h-4 w-4" />)}
              {demoButton(t.cancel, "border border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:text-rose-700", <Trash2 className="h-4 w-4" />)}
              {demoButton(t.confirmNow, "bg-teal-800 text-white hover:bg-teal-900", <Send className="h-4 w-4" />)}
              {demoIconButton("Close", "border-[1.5px] border-amber-300 bg-white text-slate-500 hover:border-amber-400 hover:text-teal-900", <X className="h-5 w-5" />)}
            </div>

            <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                  <p className="mb-2 text-base font-bold text-slate-800">{t.queueTo}</p>
                  <div className="flex flex-wrap gap-2">
                    {["Alex Morgan", "Jamie Lee"].map((name) => (
                      <span key={name} className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-base font-semibold text-teal-950">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-800 text-xs font-bold text-white">{name[0]}</span>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                  <p className="mb-2 text-base font-bold text-slate-800">{lang === "th" ? "ค่านิยม" : "Core Values"}</p>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-base font-bold ${COMMENT_TYPE_META.COMMUNICATION.tint}`}>
                    {COMMENT_TYPE_META.COMMUNICATION.emoji} {lang === "th" ? COMMENT_TYPE_META.COMMUNICATION.th : COMMENT_TYPE_META.COMMUNICATION.en}
                  </span>
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-teal-200 bg-white/90">
                <div className="flex items-center gap-2 border-b border-teal-100 bg-teal-50 px-4 py-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-800 text-sm text-white">★</span>
                  <span className="font-bold text-teal-950">{lang === "th" ? "ข้อความตัวอย่าง" : "Recognition message"}</span>
                </div>
                <p className="border-l-4 border-amber-300 px-4 py-3 text-base leading-7 text-slate-700">
                  {lang === "th" ? "รายการรอส่งและรูปการ์ดจะแสดงข้อความตัวอย่าง ที่ปรับสำนวนแล้วเป็นกล่องเดียว" : "The waiting list and card image show the refined Preview as one message panel."}
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        icon: <Search className="h-6 w-6" />,
        title: t.guideWalkthroughHistoryTitle,
        items: t.guideWalkthroughHistoryItems,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-700",
        borderColor: "border-purple-200",
        demo: (
          <div className="flex flex-wrap items-center gap-3">
            {demoButton(t.historyBackButton, "border-[1.5px] border-amber-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50")}
            {demoButton(t.historyAllYears, "border-[1.5px] border-amber-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50", <CalendarDays className="h-4 w-4" />)}
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-800">
              <CheckCircle className="h-4 w-4" />
              {t.queueConfirmed}
            </span>
          </div>
        ),
      },
      {
        icon: <Filter className="h-6 w-6" />,
        title: t.guideWalkthroughReportTitle,
        items: t.guideWalkthroughReportItems,
        iconBg: "bg-cyan-100",
        iconColor: "text-cyan-700",
        borderColor: "border-cyan-200",
        adminOnly: true,
        demo: (
          <div className="flex flex-wrap items-center gap-3">
            {demoButton(t.reportBackButton, "border-[1.5px] border-amber-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50")}
            {demoButton("HQ", "rounded-full border-[1.5px] border-amber-300 bg-teal-800 text-white shadow-sm shadow-teal-900/15 hover:bg-teal-900")}
            {demoButton(t.reportClearFilters, "border-[1.5px] border-amber-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50", <X className="h-4 w-4" />)}
            {demoButton(t.reportFilterPeople, "border-[1.5px] border-amber-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50", <Search className="h-4 w-4" />)}
          </div>
        ),
      },
      {
        icon: <Download className="h-6 w-6" />,
        title: t.guideWalkthroughExportTitle,
        items: t.guideWalkthroughExportItems,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-700",
        borderColor: "border-amber-200",
        adminOnly: true,
        demo: (
          <div className="flex flex-wrap items-center gap-3">
            {demoButton(t.reportExportCsv, "bg-teal-800 text-white shadow-sm shadow-teal-900/25 hover:bg-teal-900", <Download className="h-4 w-4" />)}
            {demoButton(t.reportExportPdf, "bg-teal-800 text-white shadow-sm shadow-teal-900/25 hover:bg-teal-900", <FileText className="h-4 w-4" />)}
            <button
              type="button"
              className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-300 px-4 py-2 text-base font-semibold text-slate-600"
            >
              <Download className="h-4 w-4" />
              {t.reportExportCsv}
            </button>
          </div>
        ),
      },
    ].filter((section) => !section.adminOnly || isAdmin);

    const guideStatusSections = [
      { id: "recognition-card", label: t.guideIntroTitle },
      { id: "core-value", label: t.guideCoreValueTitle },
      { id: "star-method", label: t.guideStarTitle },
      { id: "how-to", label: t.guideHowToTitle },
      { id: "where-to-click", label: t.guideWalkthroughTitle },
    ];
    const activeGuideSectionIndex = Math.max(
      0,
      guideStatusSections.findIndex((section) => section.id === activeGuideSection)
    );
    const guideProgress = ((activeGuideSectionIndex + 1) / guideStatusSections.length) * 100;

    return (
      <LanguageContext.Provider
        value={{
          lang,
          t: TRANSLATIONS[lang],
          setLang: this.handleSetLang,
        }}
      >
        <Navbar currentUserId={currentUserId} />
        <div className="min-h-screen pb-16">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Back Button */}
            {/* <a
              href={buildCurrentUserHref("/", currentUserId)}
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.guideBackButton}
            </a> */}

            {/* Hero Section */}
            <div className="app-surface rounded-2xl p-8 sm:p-12 mb-10 text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-200/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-lg mb-6">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  {t.guideTitle}
                </h1>
                <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  {t.guideSubtitle}
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
              <aside className="lg:sticky lg:top-24">
                <div className="rounded-2xl border-[1.5px] border-amber-300 bg-white/90 p-4 shadow-lg shadow-teal-900/10 backdrop-blur">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-base font-bold text-slate-900">{t.guideStatusLabel}</p>
                    <p className="text-sm font-semibold text-teal-800">
                      {activeGuideSectionIndex + 1}/{guideStatusSections.length}
                    </p>
                  </div>
                  <div className="mb-5 h-2 overflow-hidden rounded-full bg-amber-100">
                    <div
                      className="h-full rounded-full bg-teal-800 transition-all duration-300"
                      style={{ width: `${guideProgress}%` }}
                    />
                  </div>
                  <div className="grid gap-2">
                    {guideStatusSections.map((section, index) => {
                      const active = section.id === activeGuideSection;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => this.scrollToGuideSection(section.id)}
                          className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-[1.5px] px-3 py-3 text-left text-base font-semibold transition ${active
                            ? "border-amber-400 bg-teal-800 text-white shadow-sm shadow-teal-900/20"
                            : "border-amber-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50"
                            }`}
                        >
                          <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-white text-teal-900" : "bg-slate-100 text-slate-700"}`}>
                            {index + 1}
                          </span>
                          <span className="min-w-0 leading-6">{section.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <main className="min-w-0">
                {/* What is Recognition Card */}
                <div id="recognition-card" className="app-surface scroll-mt-36 rounded-2xl p-8 sm:p-10 mb-10">
                  <div className="flex items-start gap-5">
                    <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-md shrink-0">
                      <Star className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-3">{t.guideIntroTitle}</h2>
                      <p className="text-slate-600 leading-8 text-xl">{t.guideIntroDesc}</p>
                    </div>
                  </div>
                </div>

                {/* What is Core Value */}
                <div id="core-value" className="app-surface scroll-mt-36 rounded-2xl p-8 sm:p-10 mb-10">
                  <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-md mb-4">
                      <Heart className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{t.guideCoreValueTitle}</h2>
                    <p className="mx-auto max-w-4xl text-xl leading-8 text-slate-600">{t.guideCoreValueDesc}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {coreValueItems.map((item) => (
                      <div key={item.type} className="rounded-xl border border-amber-100 bg-white/65 p-5 shadow-sm transition hover:shadow-md">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-base font-bold ${item.tint}`}>
                          {item.label}
                        </span>
                        <p className="mt-3 text-lg leading-8 text-slate-700">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STAR Method Explanation */}
                <div id="star-method" className="app-surface scroll-mt-36 rounded-2xl p-8 sm:p-10 mb-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md mb-4">
                      <Star className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{t.guideStarTitle}</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {starItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-amber-100 hover:shadow-md transition-shadow">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${item.bg} ${item.color} text-lg font-extrabold shrink-0`}>
                          {item.label}
                        </span>
                        <p className="text-lg text-slate-700 leading-8 pt-1">{item.title}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
                    <h3 className="font-bold text-teal-950">{lang === "th" ? "STAR และ ตัวอย่าง ทำงานร่วมกันอย่างไร" : "How STAR and Preview work together"}</h3>
                    <p className="mt-2 text-lg leading-8 text-slate-700">{lang === "th" ? "ขณะเขียน STAR กล่องตัวอย่าง จะแสดงข้อความรวมแบบเรียลไทม์แต่ยังแก้ไม่ได้ เมื่อกด แก้ตัวอย่าง ระบบจะสร้างข้อความจาก STAR ล่าสุดอีกครั้งและปลดล็อกให้ปรับสำนวน หากกลับไปแก้ STAR แล้วเข้าตัวอย่างใหม่ ข้อความตัวอย่าง จะถูกสร้างใหม่จาก STAR" : "While you write STAR, Preview shows the combined message in real time but remains read-only. Selecting Edit Preview rebuilds it from the latest STAR text and unlocks wording changes. Returning to STAR and opening Preview again rebuilds the Preview."}</p>
                  </div>
                </div>

                {/* How To Section */}
                <div id="how-to" className="scroll-mt-36 mb-10">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{t.guideHowToTitle}</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full mx-auto" />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        className={`app-surface rounded-xl p-6 sm:p-8 border-l-4 ${step.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                      >
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${step.iconBg} ${step.iconColor} mb-5`}>
                          {step.icon}
                        </div>
                        <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-slate-900">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${step.color} text-white text-sm font-bold`}>
                            {i + 1}
                          </span>
                          {step.title}
                        </h3>
                        <p className="text-slate-600 leading-7 text-base">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Steps */}
                <div className="grid gap-6 mb-10 md:grid-cols-2">
                  {renderExtraStep(queueStep)}
                  {renderExtraStep(historyStep, "md:self-start")}
                  {isAdmin ? renderExtraStep(reportStep, "md:col-span-2") : null}
                </div>

                {/* Detailed Walkthrough */}
                <div id="where-to-click" className="app-surface scroll-mt-36 rounded-2xl p-8 sm:p-10 mb-10">
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{t.guideWalkthroughTitle}</h2>
                    <p className="mx-auto max-w-4xl text-xl leading-8 text-slate-600">{t.guideWalkthroughSubtitle}</p>
                  </div>

                  <div className="mx-auto grid max-w-4xl gap-6">
                    {walkthroughSections.map((section) => (
                      <section
                        key={section.title}
                        className={`rounded-xl border-l-4 ${section.borderColor} bg-white/65 p-6 shadow-sm transition hover:shadow-md sm:p-7`}
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${section.iconBg} ${section.iconColor}`}>
                            {section.icon}
                          </span>
                          <h3 className="text-2xl font-bold text-slate-900">{section.title}</h3>
                        </div>
                        <div className="space-y-4">
                          {section.items.map((item, index) => (
                            <div key={`${section.title}-${index}`} className="flex gap-3">
                              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                {index + 1}
                              </span>
                              <p className="text-lg leading-8 text-slate-700">{item}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/35 p-4">
                          {section.demo}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>

                {/* Tips Section */}
                <div className="app-surface rounded-2xl p-8 sm:p-10 mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 text-white shadow-md">
                      <Lightbulb className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{t.guideTipTitle}</h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/60 border border-purple-100 hover:shadow-md transition-shadow">
                        <span className="text-purple-500 mt-0.5 shrink-0">{tip.icon}</span>
                        <p className="text-lg text-slate-700 leading-8">{tip.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div className="app-surface rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-200/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-200/20 rounded-full blur-3xl" />

                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-lg mb-6">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                      {t.guideGetStarted}
                    </h2>
                    <a
                      href={buildCurrentUserHref("/", currentUserId)}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {t.guideGetStartedBtn}
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </LanguageContext.Provider>
    );
  }
}
