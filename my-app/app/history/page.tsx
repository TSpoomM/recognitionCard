'use client';

import { Component } from "react";
import Card from "../components/ui/Card";
import Navbar from "../components/ui/Navbar";
import Select from "../components/ui/Select";
import HistoryHeader from "../components/features/history/HistoryHeader";
import HistoryList from "../components/features/history/HistoryList";
import { getClientCurrentUserId } from "../lib/currentUser";
import { HistoryItem } from "../types/history";
import { Language, TRANSLATIONS } from "../constants/translations";
import { getInitialLanguage, LanguageContext, persistLanguage } from "../context/LanguageContext";
import Button from "../components/ui/Button";
import { FileText, Search } from "lucide-react";
import { downloadHistoryCsv, downloadHistoryPdf } from "../lib/historyExport";
import { logRecognitionAction } from "../lib/recognitionLog";

type HistoryPageState = {
  lang: Language;
  currentUserId: string;
  items: HistoryItem[];
  selectedYear: string;
  selectedPeople: string[];
  peopleQuery: string;
  isLoading: boolean;
  error: string;
};

export default class HistoryPage extends Component<Record<string, never>, HistoryPageState> {
  private cancelled = false;

  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      lang: 'th',
      currentUserId: "",
      items: [],
      selectedYear: "",
      selectedPeople: [],
      peopleQuery: "",
      isLoading: true,
      error: "",
    };
  }

  private get t() {
    return TRANSLATIONS[this.state.lang];
  }

  componentDidMount() {
    this.setState({ lang: getInitialLanguage() });
    this.setState({ currentUserId: getClientCurrentUserId() });
    this.loadHistory();
  }

  componentWillUnmount() {
    this.cancelled = true;
  }

  private get availableYears() {
    return [...new Set(this.state.items.map((item) => item.year).filter((year): year is number => year !== null))]
      .sort((a, b) => b - a);
  }

  private get filteredItems() {
    const { items, selectedYear, selectedPeople } = this.state;
    // console.log("items", items);

    return items.filter((item) => (!selectedYear || item.year === Number(selectedYear)) && (selectedPeople.length === 0 || selectedPeople.includes(item.recipient.user_id)));
  }

  private async loadHistory() {
    const currentUserId = getClientCurrentUserId();

    if (!currentUserId) {
      this.setState({
        currentUserId,
        isLoading: false,
        error: this.t.errorNoUserId,
      });
      return;
    }

    this.setState({ currentUserId });

    try {
      const response = await fetch(`/api/diary/history`, {
        headers: {
          "x-current-user-id": currentUserId,
        },
      });
      const result = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.error || "Could not load recognition history.");
      }

      if (this.cancelled) return;

      this.setState({
        items: result.data as HistoryItem[],
        error: "",
      });
    } catch (err) {
      if (this.cancelled) return;

      this.setState({
        items: [],
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      if (!this.cancelled) {
        this.setState({ isLoading: false });
      }
    }
  }

  render() {
    const { lang, currentUserId, error, isLoading, selectedYear, selectedPeople, peopleQuery } = this.state;
    const items = this.filteredItems;
    const normalizedPeopleQuery = peopleQuery.trim().toLowerCase();
    const people = Array.from(new Map(this.state.items.map((item) => [item.recipient.user_id, item.recipient])).values()).filter((person) => `${person.firstName} ${person.lastName} ${person.email} ${person.role || ""} ${person.branch || ""} ${person.branchDesc || ""} ${person.branchNameEn || ""}`.toLowerCase().includes(normalizedPeopleQuery));

    return (
      <LanguageContext.Provider value={{
        lang, t: TRANSLATIONS[lang], setLang: (newLang: Language) => {
          persistLanguage(newLang);
          this.setState({ lang: newLang });
        }
      }}>
        <Navbar currentUserId={currentUserId} />
        <main className="app-page-shell">
          <div className="mx-auto max-w-5xl">
            <Card bordered={false} padding="xl" shadow="xl" className="app-surface">
              <HistoryHeader totalRecipients={items.length} />
              <div className="mb-4 flex flex-wrap justify-end gap-2">
                <Button variant="secondary" icon={<FileText className="h-4 w-4" />} disabled={!items.length} onClick={() => { logRecognitionAction("HistoryPage_ExportExcel", currentUserId); downloadHistoryCsv(items); }}>{lang === "th" ? "ส่งออก Excel" : "Export Excel"}</Button>
                <Button icon={<FileText className="h-4 w-4" />} disabled={!items.length} onClick={() => { logRecognitionAction("HistoryPage_ExportPDF", currentUserId); downloadHistoryPdf(items); }}>{lang === "th" ? "ส่งออก PDF" : "Export PDF"}</Button>
                {/* {JSON.stringify("items")}
                {JSON.stringify(items)} */}
              </div>
              <section className="app-panel mb-6 rounded-3xl p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{this.t.historyFilters}</h2>
                    <p className="mt-1 text-base text-slate-500">{this.t.historyChooseYear}</p>
                  </div>
                  <div className="w-full sm:w-56">
                    <Select
                      label={this.t.historyYear}
                      value={selectedYear}
                      onChange={(event) => this.setState({ selectedYear: event.target.value })}
                      options={[
                        { value: "", label: this.t.historyAllYears },
                        ...this.availableYears.map((year) => ({ value: String(year), label: String(year) })),
                      ]}
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between"><p className="text-base font-semibold text-slate-700">{lang === "th" ? `กรองตามผู้รับ · เลือกแล้ว ${selectedPeople.length} คน` : `Filter by recipients · ${selectedPeople.length} selected`}</p>{selectedPeople.length > 0 && <button type="button" onClick={() => this.setState({ selectedPeople: [] })} className="text-sm font-semibold text-rose-600">{lang === "th" ? "ล้าง" : "Clear"}</button>}</div>
                  {selectedPeople.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {selectedPeople.map((personId) => {
                        const person = this.state.items.find((item) => item.recipient.user_id === personId)?.recipient;
                        if (!person) return null;
                        return <button key={personId} type="button" onClick={() => this.setState({ selectedPeople: selectedPeople.filter((id) => id !== personId) })} className="inline-flex items-center gap-2 rounded-full bg-teal-800 px-3 py-1.5 text-sm font-semibold text-white">{person.firstName} {person.lastName}<span className="text-teal-200">×</span></button>;
                      })}
                    </div>
                  )}
                  <div className="relative mb-3"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" value={peopleQuery} onChange={(event) => this.setState({ peopleQuery: event.target.value })} placeholder={lang === "th" ? "ค้นหาชื่อผู้รับ" : "Search people"} className="app-input w-full rounded-xl py-3 pl-9 pr-3 text-base" /></div>
                  <div className="rounded-2xl border-[1.5px] border-amber-300 bg-white p-2">
                    <div className="max-h-52 space-y-1 overflow-y-auto pr-2 [scrollbar-gutter:stable]">
                      {people.map((person) => { const active = selectedPeople.includes(person.user_id); return <label key={person.user_id} className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${active ? "bg-teal-800 text-white" : "text-slate-800 hover:bg-amber-50"}`}><input type="checkbox" checked={active} onChange={() => this.setState({ selectedPeople: active ? selectedPeople.filter((id) => id !== person.user_id) : [...selectedPeople, person.user_id] })} className="h-4 w-4 accent-amber-400" /><span className="font-semibold">{person.firstName} {person.lastName}</span></label>; })}
                      {people.length === 0 && <p className="py-6 text-center text-sm text-slate-500">{lang === "th" ? "ไม่พบผู้รับ" : "No people found"}</p>}
                    </div>
                  </div>
                </div>
              </section>
              <HistoryList error={error} isLoading={isLoading} items={items} onForward={(item) => {
                logRecognitionAction("HistoryPage_Forward", currentUserId);
                window.sessionStorage.setItem("recognition-forward-draft", JSON.stringify({ comment: item.comment, coreValues: item.coreValues, cardLanguage: "th" }));
                window.location.href = "/";
              }} />
            </Card>
          </div>
        </main>
      </LanguageContext.Provider>
    );
  }
}
