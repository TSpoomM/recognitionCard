'use client';

import { Component } from "react";
import Card from "../components/ui/Card";
import HistoryHeader from "../components/features/history/HistoryHeader";
import HistoryList from "../components/features/history/HistoryList";
import { getClientCurrentUserId } from "../lib/currentUser";
import { HistoryItem } from "../types/history";

type HistoryPageState = {
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
      currentUserId: "",
      items: [],
      selectedYear: "",
      isLoading: true,
      error: "",
    };
  }

  componentDidMount() {
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
        error: "Current user id is missing. Please open this page from the login system.",
      });
      return;
    }

    this.setState({ currentUserId });

    try {
      const response = await fetch(`/api/diary/history?currentUserId=${encodeURIComponent(currentUserId)}`);
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
    const { currentUserId, error, isLoading, selectedYear } = this.state;
    const items = this.filteredItems;

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Card bordered={false} padding="xl" shadow="xl">
            <HistoryHeader currentUserId={currentUserId} totalRecipients={items.length} />
            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
                  <p className="mt-1 text-base text-slate-500">Choose a year to view sent recognitions.</p>
                </div>
                <label className="w-full sm:w-56">
                  <span className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Year
                  </span>
                  <select
                    value={selectedYear}
                    onChange={(event) => this.setState({ selectedYear: event.target.value })}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-lg font-medium text-slate-900"
                  >
                    <option value="">All years</option>
                    {this.availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
            <HistoryList error={error} isLoading={isLoading} items={items} />
          </Card>
        </div>
      </main>
    );
  }
}
