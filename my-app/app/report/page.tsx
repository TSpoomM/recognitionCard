'use client';
import { Component } from "react";
import { CalendarDays, FileText, Filter, MapPin, Search, Users } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Navbar from "../components/ui/Navbar";
import Select from "../components/ui/Select";
import { getClientCurrentUserId } from "../lib/currentUser";
import { reportAccessClient } from "../lib/reportAccessClient";
import { downloadReportCsv, downloadReportPdf } from "../lib/reportExport";
import { ReportData, ReportEmployee, ReportRow } from "../types/report";
import { COMMENT_TYPE_META, COMMENT_TYPES, CommentType } from "../types/commentType";
import { Language, TRANSLATIONS } from "../constants/translations";
import { getInitialLanguage, LanguageContext, persistLanguage } from "../context/LanguageContext";
type ReportPageState = {
  lang: Language;
  currentUserId: string;
  isAdmin: boolean;
  isLoadingAccess: boolean;
  isLoadingData: boolean;
  error: string;
  data: ReportData | null;
  selectedPeople: string[];
  selectedBranches: string[];
  selectedYear: string;
  query: string;
  expandedRowIds: string[];
};
type GroupedReportRow = Omit<ReportRow, "coreValue" | "coreValueLabel"> & {
  coreValues: string[];
  coreValueLabels: string[];
};

function normalizeCoreValueCode(value: string) {
  const raw = value.trim().toUpperCase();
  const beforeParen = raw.replace(/\(.*\)$/, "").trim();
  const candidate = beforeParen.replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "_").replace(/^_+|_+$/g, "");
  if (COMMENT_TYPES.includes(candidate as CommentType)) return candidate;
  const fallback = COMMENT_TYPES.find((type) => beforeParen.includes(type));
  return fallback || candidate;
}

function getCoreValueDisplayLabel(value: string) {
  const code = normalizeCoreValueCode(value);
  const meta = COMMENT_TYPE_META[code as CommentType];
  return meta ? meta.en : value.trim();
}

function sortReportCoreValues(values: string[]) {
  return [...values].sort((a, b) => {
    const indexA = COMMENT_TYPES.indexOf(a.toUpperCase() as CommentType);
    const indexB = COMMENT_TYPES.indexOf(b.toUpperCase() as CommentType);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export default class ReportPage extends Component<Record<string, never>, ReportPageState> {
  private cancelled = false;
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      lang: 'en',
      currentUserId: "",
      isAdmin: false,
      isLoadingAccess: true,
      isLoadingData: false,
      error: "",
      data: null,
      selectedPeople: [],
      selectedBranches: [],
      selectedYear: "",
      query: "",
      expandedRowIds: [],
    };
  }

  private get t() {
    return TRANSLATIONS[this.state.lang];
  }
  componentDidMount() {
    this.setState({ lang: getInitialLanguage() });
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
    const { data, selectedBranches, selectedPeople, selectedYear } = this.state;
    if (!data) return [];
    return data.rows.filter((row) => {
      if (selectedPeople.length > 0 && !selectedPeople.includes(row.personId)) return false;
      if (selectedBranches.length > 0 && !selectedBranches.includes(row.branch)) return false;
      if (selectedYear && row.year !== Number(selectedYear)) return false;
      return true;
    });
  }

  private get groupedRows(): GroupedReportRow[] {
    const grouped = new Map<string, GroupedReportRow>();

    for (const row of this.filteredRows) {
      const groupKey = row.id.split("-").slice(0, 2).join("-");
      const coreValueCode = normalizeCoreValueCode(row.coreValue || "");
      const displayLabel = getCoreValueDisplayLabel(row.coreValue || "");
      const existing = grouped.get(groupKey);

      if (!existing) {
        grouped.set(groupKey, {
          ...row,
          id: groupKey,
          coreValues: coreValueCode ? [coreValueCode] : [],
          coreValueLabels: coreValueCode ? [displayLabel] : [],
        });
        continue;
      }

      if (coreValueCode && !existing.coreValues.includes(coreValueCode)) {
        existing.coreValues.push(coreValueCode);
      }
      if (coreValueCode && displayLabel && !existing.coreValueLabels.includes(displayLabel)) {
        existing.coreValueLabels.push(displayLabel);
      }
    }

    return Array.from(grouped.values()).map((row) => ({
      ...row,
      coreValues: sortReportCoreValues(row.coreValues),
      coreValueLabels: row.coreValueLabels,
    }));
  }
  private async loadAccess() {
    const currentUserId = getClientCurrentUserId();
    if (!currentUserId) {
      this.setState({
        currentUserId,
        isLoadingAccess: false,
        error: this.t.errorNoUserId,
      });
      return;
    }
    this.setState({ currentUserId });
    try {
      if (this.cancelled) return;
      const access = await reportAccessClient.getAccess(currentUserId);
      if (this.cancelled) return;
      const isAdmin = access.isAdmin;
      this.setState({
        isAdmin,
        isLoadingAccess: false,
        error: isAdmin ? "" : this.t.reportOnlyAdmin,
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
      selectedYear: "",
    });
  };
  private toggleRowExpanded = (rowId: string) => {
    this.setState((state) => ({
      expandedRowIds: state.expandedRowIds.includes(rowId)
        ? state.expandedRowIds.filter((id) => id !== rowId)
        : [...state.expandedRowIds, rowId],
    }));
  };
  private formatDateParts(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return {
      date: date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
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
      selectedYear,
      expandedRowIds,
    } = this.state;
    const rows = this.filteredRows;
    const displayRows = this.groupedRows;
    const exportRows = displayRows.map((row) => ({
      ...row,
      coreValue: row.coreValues.join(", "),
      coreValueLabel: row.coreValueLabels.join(", "),
    }));
    const employees = this.filteredEmployees;
    const totalRows = data?.rows.length ?? 0;
    const activeFilterCount = selectedBranches.length + selectedPeople.length + (selectedYear ? 1 : 0);
    const visibleRecipientCount = displayRows.length;
    const visibleBranchCount = new Set(displayRows.map((row) => row.branch).filter(Boolean)).size;
    const reportLabels = this.state.lang === "th"
      ? {
        results: "ผลลัพธ์",
        rows: "รายการ",
        allRows: "รายการทั้งหมด",
        recipients: "ผู้รับ",
        branches: "สาขา",
        year: "ปี",
        allYears: "ทุกปี",
        activeFilters: "ตัวกรองที่เลือก",
        noActiveFilters: "ยังไม่ได้เลือกตัวกรอง",
        searchPeople: "ค้นหาชื่อพนักงาน",
      }
      : {
        results: "Results",
        rows: "rows",
        allRows: "Total rows",
        recipients: "Recipients",
        branches: "Branches",
        year: "Year",
        allYears: "All years",
        activeFilters: "Active filters",
        noActiveFilters: "No active filters",
        searchPeople: "Search people",
      };
    if (isLoadingAccess) {
      return (
        <main className="flex min-h-screen items-center justify-center px-6">
          <p className="text-base text-slate-600">{this.t.reportCheckingAccess}</p>
        </main>
      );
    }
    if (!isAdmin) {
      return (
        <main className="flex min-h-screen items-center justify-center px-6">
          <Card padding="xl" shadow="xl" className="app-surface max-w-md text-center">
            <p className="text-lg font-semibold text-slate-900">{this.t.reportAccessDenied}</p>
            <p className="mt-2 text-base text-slate-600">{error || this.t.reportOnlyAdmin}</p>
          </Card>
        </main>
      );
    }
    return (
      <LanguageContext.Provider value={{
        lang: this.state.lang, t: TRANSLATIONS[this.state.lang], setLang: (newLang: Language) => {
          persistLanguage(newLang);
          this.setState({ lang: newLang });
        }
      }}>
        <Navbar currentUserId={currentUserId} />
        <div className="app-page-shell">
          <div className="mx-auto max-w-[96rem]">
            <Card bordered={false} padding="none" shadow="xl" className="app-surface mb-8 overflow-hidden text-base sm:text-lg">
              <div className="flex flex-col gap-5 border-b-[1.5px] border-amber-300/80 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">
                    {this.t.reportRecognitionCard}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-slate-950">{this.t.reportTitle}</h1>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">{this.t.reportSubtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Button
                    variant="secondary"
                    className="h-12 rounded-full"
                    icon={<FileText className="h-5 w-5" />}
                    disabled={displayRows.length === 0}
                    onClick={() => downloadReportCsv(exportRows)}
                  >
                    {this.t.reportExportCsv}
                  </Button>
                  <Button
                    className="h-12 rounded-full px-5"
                    icon={<FileText className="h-5 w-5" />}
                    disabled={displayRows.length === 0}
                    onClick={() => downloadReportPdf(exportRows)}
                  >
                    {this.t.reportExportPdf}
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 sm:px-8 xl:grid-cols-4">
                {[
                  { label: reportLabels.results, value: displayRows.length.toLocaleString(), helper: `${totalRows.toLocaleString()} ${reportLabels.allRows}`, icon: FileText },
                  { label: reportLabels.recipients, value: visibleRecipientCount.toLocaleString(), helper: `${employees.length.toLocaleString()} ${reportLabels.recipients}`, icon: Users },
                  { label: reportLabels.branches, value: visibleBranchCount.toLocaleString(), helper: `${data?.branches.length ?? 0} ${reportLabels.branches}`, icon: MapPin },
                  { label: reportLabels.year, value: selectedYear || reportLabels.allYears, helper: `${activeFilterCount} ${reportLabels.activeFilters}`, icon: CalendarDays },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border-[1.5px] border-amber-300 bg-white/75 p-4 shadow-sm shadow-teal-900/5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-500">{item.label}</p>
                          <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
                        </div>
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-800">
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                      <p className="mt-3 text-base text-slate-500">{item.helper}</p>
                    </div>
                  );
                })}
              </div>
              {error && (
                <div className="mx-6 mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700 sm:mx-8">
                  {error}
                </div>
              )}
              {isLoadingData ? (
                <Card padding="lg" className="mx-6 mb-6 p-12 text-center text-base text-slate-500 sm:mx-8">
                  {this.t.historyLoading}
                </Card>
              ) : (
                <div className="grid gap-5 px-6 pb-6 sm:px-8 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)] lg:items-stretch">
                  <aside className="app-panel rounded-3xl p-5 lg:h-full lg:self-stretch">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-800">
                          <Filter className="h-5 w-5" />
                        </span>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900">{this.t.reportFilters}</h2>
                          {/* <p className="text-base text-slate-500">
                            {activeFilterCount > 0 ? `${activeFilterCount} ${reportLabels.activeFilters}` : reportLabels.noActiveFilters}
                          </p> */}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={this.clearFilters}
                        className="shrink-0 text-base font-semibold text-slate-500 hover:text-slate-900"
                      >
                        {this.t.reportClearFilters}
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="mb-3 text-lg font-semibold uppercase tracking-wide text-slate-500">
                          {this.t.reportFilterBranch}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(data?.branches || []).map((branch) => {
                            const active = selectedBranches.includes(branch);
                            return (
                              <label
                                key={branch}
                                className={`flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-base font-medium transition ${active
                                  ? "border-amber-400 bg-teal-800 text-white"
                                  : "border-amber-300 bg-white/75 text-slate-700 hover:border-amber-400 hover:bg-amber-50"
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={() => this.toggleBranch(branch)}
                                  className="hidden"
                                />
                                {branch}
                              </label>
                            );
                          })}
                          {(data?.branches.length || 0) === 0 && (
                            <p className="text-base text-slate-400">{this.t.reportNoFilters}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Select
                          label={this.t.reportFilterYear}
                          value={selectedYear}
                          onChange={(e) => this.setState({ selectedYear: e.target.value })}
                          options={[
                            { value: "", label: this.t.historyAllYears },
                            ...(data?.years || []).map((year) => ({ value: String(year), label: String(year) })),
                          ]}
                        />
                      </div>

                      <div>
                        <p className="mb-3 text-base font-semibold uppercase tracking-wide text-slate-500">
                          {this.t.reportFilterPeople}
                        </p>
                        <div className="relative mb-3">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder={reportLabels.searchPeople}
                            value={query}
                            onChange={(e) => this.setState({ query: e.target.value })}
                            className="app-input w-full rounded-xl py-3 pl-9 pr-3 text-lg"
                          />
                        </div>
                        <div className="max-h-72 space-y-1 overflow-y-auto rounded-2xl border-[1.5px] border-amber-300 bg-white/70 p-2">
                          {employees.map((employee) => {
                            const active = selectedPeople.includes(employee.user_id);
                            return (
                              <label
                                key={employee.user_id}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${active ? "bg-teal-50 text-teal-950" : "hover:bg-teal-50/60"
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={() => this.togglePerson(employee.user_id)}
                                  className="h-4 w-4 rounded border-amber-300 text-teal-800 focus:ring-amber-300"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-lg font-semibold text-slate-800">{employee.name}</span>
                                  <span className="block truncate text-base text-slate-500">{employee.branch}</span>
                                </span>
                              </label>
                            );
                          })}
                          {employees.length === 0 && (
                            <p className="py-4 text-center text-xs text-slate-400">{this.t.reportNoFilters}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </aside>

                  <section className="app-panel min-w-0 overflow-hidden rounded-3xl">
                    <div className="flex flex-col gap-3 border-b-[1.5px] border-amber-300 p-5 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-3xl font-semibold text-slate-900">{reportLabels.results}</h2>
                          <span className="app-chip rounded-full px-3 py-1 text-lg font-semibold">
                            {rows.length} {reportLabels.rows}
                          </span>
                        </div>
                        <p className="mt-1 text-base text-slate-500">
                          {activeFilterCount > 0 ? `${activeFilterCount} ${reportLabels.activeFilters}` : reportLabels.noActiveFilters}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBranches.map((branch) => (
                          <span
                            key={branch}
                            className="app-chip rounded-full px-3 py-1 text-xs font-semibold"
                          >
                            {branch}
                          </span>
                        ))}
                        {selectedPeople.slice(0, 3).map((personId) => {
                          const employee = data?.employees.find((item) => item.user_id === personId);
                          return employee ? (
                            <span
                              key={personId}
                              className="app-chip rounded-full px-3 py-1 text-xs font-semibold"
                            >
                              {employee.name}
                            </span>
                          ) : null;
                        })}
                        {selectedPeople.length > 3 && (
                          <span className="app-chip rounded-full px-3 py-1 text-xs font-semibold">
                            +{selectedPeople.length - 3} more
                          </span>
                        )}
                        {selectedYear && (
                          <span className="app-chip rounded-full px-3 py-1 text-xs font-semibold">
                            {selectedYear}
                          </span>
                        )}
                      </div>
                    </div>
                    {displayRows.length === 0 ? (
                      <div className="p-12 text-center text-base text-slate-500">
                        {this.t.historyNoRecognitions}
                      </div>
                    ) : (
                      <div className="max-h-[650px] overflow-y-auto overflow-x-auto 2xl:overflow-x-visible">
                        <table className="w-full min-w-[1080px] table-fixed border-collapse text-lg 2xl:min-w-0">
                          <colgroup>
                            <col className="w-[15%]" />
                            <col className="w-[9%]" />
                            <col className="w-[15%]" />
                            <col className="w-[32%]" />
                            <col className="w-[12%]" />
                            <col className="w-[11%]" />
                          </colgroup>
                          <thead className="sticky top-0 z-10 border-b-[1.5px] border-amber-300 bg-teal-50/95 text-left text-sm font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">
                            <tr>
                              <th className="whitespace-nowrap px-4 py-3">Recipients</th>
                              <th className="whitespace-nowrap px-4 py-3">Branch</th>
                              <th className="whitespace-nowrap px-4 py-3">Core Value</th>
                              <th className="whitespace-nowrap px-4 py-3">Comment</th>
                              <th className="whitespace-nowrap px-4 py-3">Given By</th>
                              <th className="whitespace-nowrap px-4 py-3">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayRows.map((row) => {
                              const isExpanded = expandedRowIds.includes(row.id);
                              const createdAt = this.formatDateParts(row.createdAt);
                              return (
                                <tr key={row.id} className="border-b border-amber-100 align-top transition hover:bg-teal-50/35 last:border-b-0">
                                  <td className="truncate px-4 py-4 font-medium text-slate-900">
                                    {row.personName}
                                  </td>
                                  <td className="truncate px-4 py-4 text-slate-600">{row.branch}</td>
                                  <td className="px-4 py-4">
                                    {row.coreValueLabels?.length ? (
                                      <div className="flex flex-wrap gap-2">
                                        {row.coreValueLabels.map((label) => (
                                          <span key={label} className="app-chip inline-block max-w-full truncate rounded-full px-3 py-1 text-sm font-semibold">
                                            {label}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-slate-700">
                                    <div className="flex h-full min-h-[6rem] flex-col">
                                      <div
                                        className={
                                          isExpanded
                                            ? "whitespace-pre-wrap break-words pr-1"
                                            : "h-full overflow-y-auto whitespace-pre-wrap break-words pr-1"
                                        }
                                      >
                                        {row.comment || <span className="text-slate-400">-</span>}
                                      </div>
                                      {/* {row.comment.trim() ? (
                                        <button
                                          type="button"
                                          onClick={() => this.toggleRowExpanded(row.id)}
                                          className="mt-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                                        >
                                          {isExpanded ? "Show less" : "Show full comment"}
                                        </button>
                                      ) : null} */}
                                    </div>
                                  </td>
                                  <td className="truncate px-4 py-4 text-slate-600">{row.senderName}</td>
                                  <td className="px-4 py-4 text-slate-500">
                                    {createdAt ? (
                                      <time dateTime={row.createdAt || undefined} className="block leading-relaxed">
                                        <span className="block whitespace-nowrap">{createdAt.date}</span>
                                        <span className="block whitespace-nowrap text-slate-400">{createdAt.time}</span>
                                      </time>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
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
      </LanguageContext.Provider>
    );
  }
}
