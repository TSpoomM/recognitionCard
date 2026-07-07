'use client';

import { Component } from "react";
import { LanguageContext, getInitialLanguage, persistLanguage } from "../context/LanguageContext";
import { TRANSLATIONS, Language } from "../constants/translations";
import { buildCurrentUserHref, getClientCurrentUserId } from "../lib/currentUser";
import Navbar from "../components/ui/Navbar";
import { ArrowLeft, Users, Heart, MessageSquare, Clock, History, Star, Lightbulb, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

type GuideState = {
  lang: Language;
  currentUserId: string;
};

export default class GuidePage extends Component<Record<string, never>, GuideState> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      lang: 'en',
      currentUserId: "",
    };
  }

  componentDidMount() {
    this.setState({
      lang: getInitialLanguage(),
      currentUserId: getClientCurrentUserId(),
    });
  }

  private handleSetLang = (lang: Language) => {
    this.setState({ lang });
  };

  render() {
    const { lang, currentUserId } = this.state;
    const t = TRANSLATIONS[lang];

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
        desc: t.guideStep3Desc,
        color: "from-amber-400 to-orange-500",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
    ];

    const extraSteps = [
      {
        icon: <Clock className="h-8 w-8" />,
        title: t.guideQueueTitle,
        desc: t.guideQueueDesc,
        color: "from-blue-400 to-indigo-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        icon: <History className="h-8 w-8" />,
        title: t.guideHistoryTitle,
        desc: t.guideHistoryDesc,
        color: "from-purple-400 to-violet-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
    ];

    const starItems = [
      { label: "S", title: t.guideStarSituation, color: "text-teal-600", bg: "bg-teal-100" },
      { label: "T", title: t.guideStarTask, color: "text-amber-600", bg: "bg-amber-100" },
      { label: "A", title: t.guideStarAction, color: "text-rose-600", bg: "bg-rose-100" },
      { label: "R", title: t.guideStarResult, color: "text-blue-600", bg: "bg-blue-100" },
    ];

    const tips = [
      { icon: <CheckCircle className="h-5 w-5" />, text: t.guideTip1 },
      { icon: <CheckCircle className="h-5 w-5" />, text: t.guideTip2 },
      { icon: <CheckCircle className="h-5 w-5" />, text: t.guideTip3 },
      { icon: <CheckCircle className="h-5 w-5" />, text: t.guideTip4 },
    ];

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
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Back Button */}
            <a
              href={buildCurrentUserHref("/", currentUserId)}
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.guideBackButton}
            </a>

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
                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  {t.guideSubtitle}
                </p>
              </div>
            </div>

            {/* What is Recognition Card */}
            <div className="app-surface rounded-2xl p-8 sm:p-10 mb-10">
              <div className="flex items-start gap-5">
                <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-md shrink-0">
                  <Star className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{t.guideIntroTitle}</h2>
                  <p className="text-slate-600 leading-relaxed text-lg">{t.guideIntroDesc}</p>
                </div>
              </div>
            </div>

            {/* How To Section */}
            <div className="mb-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{t.guideHowToTitle}</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full mx-auto" />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={`app-surface rounded-xl p-6 sm:p-8 border-l-4 ${step.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${step.iconBg} ${step.iconColor} mb-5`}>
                      {step.icon}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${step.color} text-white text-sm font-bold`}>
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Extra Steps (Queue & History) */}
            <div className="grid gap-6 md:grid-cols-2 mb-10">
              {extraSteps.map((step, i) => (
                <div
                  key={i}
                  className={`app-surface rounded-xl p-6 sm:p-8 border-l-4 ${step.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${step.iconBg} ${step.iconColor} mb-5`}>
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* STAR Method Explanation */}
            <div className="app-surface rounded-2xl p-8 sm:p-10 mb-10">
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
                    <p className="text-slate-700 leading-relaxed pt-1.5">{item.title}</p>
                  </div>
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
                    <p className="text-slate-700 leading-relaxed">{tip.text}</p>
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
          </div>
        </div>
      </LanguageContext.Provider>
    );
  }
}