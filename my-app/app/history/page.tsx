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

type HistoryPageState = {
  lang: Language;
  currentUserId: string;
  items: HistoryItem[];
  selectedYear: string;
  isLoading: boolean;
  error: string;
};

export default class HistoryPage extends Component<Record<string, never>, HistoryPageState> {
  private cancelled = false;

  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      lang: 'en',
      currentUserId: "",
      items: [],
      selectedYear: "",
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
    const { items, selectedYear } = this.state;
    if (!selectedYear) return items;
    return items.filter((item) => item.year === Number(selectedYear));
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
    const { lang, currentUserId, error, isLoading, selectedYear } = this.state;
    const items = this.filteredItems;

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
              </section>
              <HistoryList error={error} isLoading={isLoading} items={items} />
            </Card>
          </div>
        </main>
      </LanguageContext.Provider>
    );
  }
}
