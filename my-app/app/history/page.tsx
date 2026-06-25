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
    const { currentUserId, error, isLoading, items } = this.state;

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Card bordered={false} padding="xl" shadow="xl">
            <HistoryHeader currentUserId={currentUserId} totalRecipients={items.length} />
            <HistoryList error={error} isLoading={isLoading} items={items} />
          </Card>
        </div>
      </main>
    );
  }
}
