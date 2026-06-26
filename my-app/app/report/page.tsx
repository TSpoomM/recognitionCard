'use client';

import { Component } from "react";
import Link from "next/link";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { buildCurrentUserHref, getClientCurrentUserId } from "../lib/currentUser";
import { downloadReportCsv, downloadReportPdf } from "../lib/reportExport";
import { ReportData, ReportEmployee, ReportRow } from "../types/report";

type ReportPageState = {
  currentUserId: string;
  isAdmin: boolean;
  isLoadingAccess: boolean;
  isLoadingData: boolean;
  error: string;
  data: ReportData | null;
  selectedPeople: string[];
  selectedBranches: string[];
  query: string;
};

export default class ReportPage extends Component<Record<string, never>, ReportPageState> {
  private cancelled = false;

  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      currentUserId: "",
      isAdmin: false,
      isLoadingAccess: true,
      isLoadingData: false,
      error: "",
      data: null,
      selectedPeople: [],
      selectedBranches: [],
      query: "",
    };
  }

  componentDidMount() {
    this.loadAccess();
  }

  componentWillUnmount() {
    this.cancelled = true;
  }

  private get filteredEmployees(): ReportEmployee[] {
    const { data, query, selectedBranches } = this.state;
    if (!data) return [];

    const normalizedQuery = query.trim().toLowerCase();

    return data.employees.filter((employee) => {
      if (selectedBranches.length > 0 && !selectedBranches.includes(employee.branch)) {
        return false;
      }

      if (!normalizedQuery) return true;

      return (
        employee.name.toLowerCase().includes(normalizedQuery) ||
        employee.branch.toLowerCase().includes(normalizedQuery)
      );
    });
  }

  private get filteredRows(): ReportRow[] {
    const { data, selectedBranches, selectedPeople } = this.state;
    if (!data) return [];

    return data.rows.filter((row) => {
      if (selectedPeople.length > 0 && !selectedPeople.includes(row.personId)) return false;
      if (selectedBranches.length > 0 && !selectedBranches.includes(row.branch)) return false;
      return true;
    });
  }

  private async loadAccess() {
    const currentUserId = getClientCurrentUserId();

    if (!currentUserId) {
      this.setState({
        currentUserId,
        isLoadingAccess: false,
        error: "Current user id is missing. Please open this page from the login system.",
      });
      return;
    }

    this.setState({ currentUserId });

    try {
      const response = await fetch(
        `/api/report/access?currentUserId=${encodeURIComponent(currentUserId)}`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Could not verify report access.");
      }

      if (this.cancelled) return;

      const isAdmin = Boolean(result.data?.isAdmin);

      this.setState({
        isAdmin,
        isLoadingAccess: false,
        error: isAdmin ? "" : "Only admin users can access the recognition report.",
      });

      if (isAdmin) {
        await this.loadReportData(currentUserId);
      }
    } catch (err) {
      if (this.cancelled) return;

      this.setState({
        isLoadingAccess: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async loadReportData(currentUserId: string) {
    this.setState({ isLoadingData: true, error: "" });

    try {
      const response = await fetch(
        `/api/report?currentUserId=${encodeURIComponent(currentUserId)}`
      );
      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Could not load recognition report.");
      }

      if (this.cancelled) return;

      this.setState({
        data: result.data as ReportData,
        error: "",
      });
    } catch (err) {
      if (this.cancelled) return;

      this.setState({
        data: null,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      if (!this.cancelled) {
        this.setState({ isLoadingData: false });
      }
    }
  }

  private togglePerson = (personId: string) => {
    this.setState((state) => ({
      selectedPeople: state.selectedPeople.includes(personId)
        ? state.selectedPeople.filter((id) => id !== personId)
        : [...state.selectedPeople, personId],
    }));
  };

  private toggleBranch = (branch: string) => {
    this.setState((state) => ({
      selectedBranches: state.selectedBranches.includes(branch)
        ? state.selectedBranches.filter((value) => value !== branch)
        : [...state.selectedBranches, branch],
    }));
  };

  private clearFilters = () => {
    this.setState({
      selectedPeople: [],
      selectedBranches: [],
      query: "",
    });
  };

  private formatDate(value: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  render() {
    const {
      currentUserId,
      data,
      error,
      isAdmin,
      isLoadingAccess,
      isLoadingData,
      query,
      selectedBranches,
      selectedPeople,
    } = this.state;

    const rows = this.filteredRows;
    const employees = this.filteredEmployees;
    const homeHref = buildCurrentUserHref("/", currentUserId);

    if (isLoadingAccess) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
          <p className="text-sm text-slate-600">Checking report access...</p>
        </main>
      );
    }

    if (!isAdmin) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
          <Card padding="xl" shadow="xl" className="max-w-md text-center">
            <p className="text-lg font-semibold text-slate-900">Access denied</p>
            <p className="mt-2 text-sm text-slate-600">{error || "Only admin users can access this page."}</p>
            <Link
              href={homeHref}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
            >
              Back to home
            </Link>
          </Card>
        </main>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Card bordered={false} padding="xl" shadow="xl" className="mb-10">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Recognition Card
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900">Recognition Report</h1>
                <p className="mt-1 text-sm text-slate-500">Filter by people or branch, then export PDF or CSV.</p>
              </div>
              <Link
                href={homeHref}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
              >
                Back to recognize
              </Link>
            </div>

            <div className="mb-6 flex flex-wrap justify-end gap-2">
              <Button
                variant="secondary"
                className="h-11 rounded-full border border-slate-300 bg-white px-5 text-slate-900 hover:border-slate-400"
                disabled={rows.length === 0}
                onClick={() => downloadReportCsv(rows)}
              >
                Export CSV
              </Button>
              <Button
                className="h-11 rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800"
                disabled={rows.length === 0}
                onClick={() => downloadReportPdf(rows)}
              >
                Export PDF
              </Button>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {isLoadingData ? (
              <Card padding="lg" className="p-12 text-center text-sm text-slate-500">
                Loading report data...
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <aside className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
                    <button
                      type="button"
                      onClick={this.clearFilters}
                      className="text-xs text-slate-500 transition hover:text-slate-800"
                    >
                      Clear
                    </button>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Branches</p>
                    <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                      {(data?.branches || []).map((branch) => {
                        const active = selectedBranches.includes(branch);
                        return (
                          <label
                            key={branch}
                            className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${active
                              ? "border-slate-900 bg-slate-50 ring-1 ring-slate-200"
                              : "border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => this.toggleBranch(branch)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-slate-700">{branch}</span>
                          </label>
                        );
                      })}
                      {(data?.branches.length || 0) === 0 && (
                        <p className="py-4 text-center text-xs text-slate-400">No branches found.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">People</p>
                    <input
                      type="text"
                      placeholder="Search people..."
                      value={query}
                      onChange={(event) => this.setState({ query: event.target.value })}
                      className="mb-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                    />
                    <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                      {employees.map((employee) => {
                        const active = selectedPeople.includes(employee.user_id);
                        return (
                          <label
                            key={employee.user_id}
                            className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${active
                              ? "border-slate-900 bg-slate-50 ring-1 ring-slate-200"
                              : "border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => this.togglePerson(employee.user_id)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="min-w-0 flex-1 truncate text-slate-700">{employee.name}</span>
                            <span className="text-[10px] text-slate-400">{employee.branch}</span>
                          </label>
                        );
                      })}
                      {employees.length === 0 && (
                        <p className="py-4 text-center text-xs text-slate-400">No matches.</p>
                      )}
                    </div>
                  </div>
                </aside>

                <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-900">Results</h2>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {rows.length} rows
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedBranches.map((branch) => (
                        <span
                          key={branch}
                          className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {branch}
                        </span>
                      ))}
                      {selectedPeople.slice(0, 3).map((personId) => {
                        const employee = data?.employees.find((item) => item.user_id === personId);
                        return employee ? (
                          <span
                            key={personId}
                            className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {employee.name}
                          </span>
                        ) : null;
                      })}
                      {selectedPeople.length > 3 && (
                        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                          +{selectedPeople.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {rows.length === 0 ? (
                    <div className="p-12 text-center text-sm text-slate-500">
                      No recognitions match these filters yet.
                    </div>
                  ) : (
                    <div className="max-h-[560px] overflow-y-auto overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/95 text-left text-xs uppercase tracking-wide text-slate-500 backdrop-blur">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Employee</th>
                            <th className="px-4 py-3 font-semibold">Branch</th>
                            <th className="px-4 py-3 font-semibold">Core Value</th>
                            <th className="px-4 py-3 font-semibold">Comment</th>
                            <th className="px-4 py-3 font-semibold">Sent By</th>
                            <th className="px-4 py-3 font-semibold">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                              <td className="px-4 py-3 font-medium text-slate-900">{row.personName}</td>
                              <td className="px-4 py-3 text-slate-600">{row.branch}</td>
                              <td className="px-4 py-3">
                                {row.coreValueLabel ? (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                    {row.coreValueLabel}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="max-w-md px-4 py-3 text-slate-700">{row.comment}</td>
                              <td className="px-4 py-3 text-slate-600">{row.senderName}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                                {this.formatDate(row.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }
}