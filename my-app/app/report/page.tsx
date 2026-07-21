'use client';
import { Component } from "react";
import { CalendarDays, ChevronRight, FileText, Filter, MapPin, Search, Users } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Navbar from "../components/ui/Navbar";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import { getClientCurrentUserId } from "../lib/currentUser";
import { reportAccessClient } from "../lib/reportAccessClient";
import { downloadReportCsv, downloadReportPdf } from "../lib/reportExport";
import { logRecognitionAction } from "../lib/recognitionLog";
import { withBasePath } from "../lib/basePath";
import {
  getCoreValueDisplayLabel,
  normalizeCoreValueCode,
  sortCoreValues,
  toggleArrayItem,
} from "../lib/reportUtils";
import { ReportData, ReportEmployee, ReportRow } from "../types/report";
import { COMMENT_TYPE_META, COMMENT_TYPES, CommentType } from "../types/commentType";
import { Language, TRANSLATIONS } from "../constants/translations";
import { getInitialLanguage, LanguageContext, persistLanguage } from "../context/LanguageContext";
type ReportPageState = {
  lang: Language;
  currentUserId: string;
  canAccessReport: boolean;
  isLoadingAccess: boolean;
  isLoadingData: boolean;
  error: string;
  data: ReportData | null;
  selectedPeople: string[];
  selectedBranches: string[];
  selectedYears: string[];
  selectedCoreValues: string[];
  query: string;
  expandedRowIds: string[];
  filterModal: "branch" | "coreValue" | "year" | "people" | null;
};
type GroupedReportRow = Omit<ReportRow, "coreValue" | "coreValueLabel"> & {
  coreValues: string[];
  coreValueLabels: string[];
};

export default class ReportPage extends Component<Record<string, never>, ReportPageState> {
  private cancelled = false;
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      lang: 'th',
      currentUserId: "",
      canAccessReport: false,
      isLoadingAccess: true,
      isLoadingData: false,
      error: "",
      data: null,
      selectedPeople: [],
      selectedBranches: [],
      selectedYears: [],
      selectedCoreValues: [],
      query: "",
      expandedRowIds: [],
      filterModal: null,
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
    const { data, selectedBranches, selectedPeople, selectedYears } = this.state;
    if (!data) return [];
    return data.rows.filter((row) => {
      if (selectedPeople.length > 0 && !selectedPeople.includes(row.personId)) return false;
      if (selectedBranches.length > 0 && !selectedBranches.includes(row.branch)) return false;
      if (selectedYears.length > 0 && !selectedYears.includes(String(row.year))) return false;
      return true;
    });
  }

  private get groupedRows(): GroupedReportRow[] {
    const grouped = new Map<string, GroupedReportRow>();

    for (const row of this.filteredRows) {
      const groupKey = row.id.split("-").slice(0, 2).join("-");
      const rawCoreValues = (row.coreValue || "").split(/[,;|]/).map((value) => value.trim()).filter(Boolean);
      const coreValueCodes = rawCoreValues.map(normalizeCoreValueCode).filter(Boolean);
      const displayLabels = rawCoreValues.map(getCoreValueDisplayLabel).filter(Boolean);
      const existing = grouped.get(groupKey);

      if (!existing) {
        grouped.set(groupKey, {
          ...row,
          id: groupKey,
          coreValues: coreValueCodes,
          coreValueLabels: displayLabels,
        });
        continue;
      }

      coreValueCodes.forEach((code) => { if (!existing.coreValues.includes(code)) existing.coreValues.push(code); });
      displayLabels.forEach((label) => { if (!existing.coreValueLabels.includes(label)) existing.coreValueLabels.push(label); });
    }

    const groupedRows = Array.from(grouped.values()).map((row) => ({
      ...row,
      coreValues: sortCoreValues(row.coreValues),
      coreValueLabels: row.coreValueLabels,
    }));

    const { selectedCoreValues } = this.state;
    if (selectedCoreValues.length === 0) return groupedRows;

    return groupedRows.filter((row) =>
      selectedCoreValues.some((selectedValue) => row.coreValues.includes(selectedValue))
    );
  }
  private async loadAccess() {
    const currentUserId = await getClientCurrentUserId();
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
      const canAccessReport = access.canAccessReport;
      this.setState({
        canAccessReport,
        isLoadingAccess: false,
        error: canAccessReport ? "" : this.t.reportOnlyAdmin,
      });
      if (canAccessReport) {
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
      const response = await fetch(withBasePath("/api/report"), {
        headers: {
          "x-current-user-id": currentUserId,
        },
      });
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
      selectedPeople: toggleArrayItem(state.selectedPeople, personId),
    }));
  };
  private toggleBranch = (branch: string) => {
    this.setState((state) => ({
      selectedBranches: toggleArrayItem(state.selectedBranches, branch),
    }));
  };
  private toggleCoreValue = (value: string) => {
    this.setState((state) => ({
      selectedCoreValues: toggleArrayItem(state.selectedCoreValues, value),
    }));
  };
  private clearFilters = () => {
    this.setState({
      selectedPeople: [],
      selectedBranches: [],
      query: "",
      selectedYears: [],
      selectedCoreValues: [],
    });
  };
  private toggleRowExpanded = (rowId: string) => {
    this.setState((state) => ({
      expandedRowIds: toggleArrayItem(state.expandedRowIds, rowId),
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
      canAccessReport,
      isLoadingAccess,
      isLoadingData,
      query,
      selectedBranches,
      selectedPeople,
      selectedYears,
      selectedCoreValues,
      expandedRowIds,
    } = this.state;
    const displayRows = this.groupedRows;
    const exportRows = displayRows.map((row) => ({
      ...row,
      coreValue: row.coreValues.join(", "),
      coreValueLabel: row.coreValueLabels.join(", "),
    }));
    const employees = this.filteredEmployees;
    const activeFilterCount = selectedBranches.length + selectedCoreValues.length + selectedPeople.length + selectedYears.length;
    const visibleRecipientCount = new Set(
      displayRows.map((row) => row.personId).filter(Boolean)
    ).size;
    const visibleBranchCount = new Set(displayRows.map((row) => row.branch).filter(Boolean)).size;
    const sortedSelectedYears = [...selectedYears].sort((a, b) => Number(b) - Number(a));
    const sortedYears = [...(data?.years || [])].sort((a, b) => b - a);
    const reportLabels = this.state.lang === "th"
      ? {
        results: "บัตรส่งต่อคุณค่า",
        rows: "รายการ",
        allRows: "รายการ",
        recipients: "ผู้รับ",
        branches: "สาขา",
        year: "ปี",
        allYears: "ทุกปี",
        activeFilters: "ตัวกรองที่เลือก",
        noActiveFilters: "ยังไม่ได้เลือกตัวกรอง",
        searchPeople: "ค้นหาชื่อพนักงาน",
      }
      : {
        results: "Recognition cards",
        rows: "cards",
        allRows: "rows",
        recipients: "Recipients",
        branches: "Branches",
        year: "Year",
        allYears: "All years",
        activeFilters: "Active filters",
        noActiveFilters: "No active filters",
        searchPeople: "Search people",
      };
    const filterStatusGroups = [
      {
        key: "branch",
        label: this.state.lang === "th" ? "สาขา" : "Branches",
        items: selectedBranches,
        className: "border-sky-200 bg-sky-50 text-sky-800",
      },
      {
        key: "coreValue",
        label: this.state.lang === "th" ? "ค่านิยม" : "Core Values",
        items: selectedCoreValues.map((value) => {
          const meta = COMMENT_TYPE_META[value as CommentType];
          return meta ? `${meta.emoji} ${this.state.lang === "th" ? meta.th : meta.en}` : value;
        }),
        className: "border-violet-200 bg-violet-50 text-violet-800",
      },
      {
        key: "people",
        label: this.state.lang === "th" ? "ผู้รับ" : "Recipients",
        items: selectedPeople
          .map((personId) => data?.employees.find((item) => item.user_id === personId)?.name)
          .filter((name): name is string => Boolean(name)),
        className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      },
      {
        key: "year",
        label: this.state.lang === "th" ? "ปี" : "Years",
        items: sortedSelectedYears,
        className: "border-amber-200 bg-amber-50 text-amber-800",
      },
    ].filter((group) => group.items.length > 0);
    if (isLoadingAccess) {
      return (
        <main className="flex min-h-screen items-center justify-center px-6">
          <p className="text-base text-slate-600">{this.t.reportCheckingAccess}</p>
        </main>
      );
    }
    if (!canAccessReport) {
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
                  <p className="text-xl font-semibold uppercase tracking-[0.2em] text-teal-800">
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
                    onClick={() => {
                      logRecognitionAction("ReportPage_ExportExcel", currentUserId);
                      downloadReportCsv(exportRows);
                    }}
                  >
                    {this.t.reportExportCsv}
                  </Button>
                  <Button
                    className="h-12 rounded-full px-5"
                    icon={<FileText className="h-5 w-5" />}
                    disabled={displayRows.length === 0}
                    onClick={() => {
                      logRecognitionAction("ReportPage_ExportPDF", currentUserId);
                      downloadReportPdf(exportRows);
                      // console.log("export rows", exportRows);

                    }}
                  >
                    {this.t.reportExportPdf}
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 sm:px-8 xl:grid-cols-4">
                {[
                  { label: reportLabels.results, value: displayRows.length.toLocaleString(), helper: `${displayRows.length.toLocaleString()} ${reportLabels.rows}`, icon: FileText },
                  { label: reportLabels.recipients, value: visibleRecipientCount.toLocaleString(), helper: `${(data?.employees.length ?? 0).toLocaleString()} ${reportLabels.recipients}`, icon: Users },
                  { label: reportLabels.branches, value: visibleBranchCount.toLocaleString(), helper: `${data?.branches.length ?? 0} ${reportLabels.branches}`, icon: MapPin },
                  {
                    label: this.state.lang === "th" ? "ปีที่แสดง" : "Years shown",
                    value: (selectedYears.length || data?.years.length || 0).toLocaleString(),
                    helper: this.state.lang === "th"
                      ? `${data?.years.length ?? 0} ปี`
                      : `${data?.years.length ?? 0} years`,
                    icon: CalendarDays,
                  },
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
                      {item.helper && <p className="mt-3 text-base text-slate-500">{this.t.reportFrom} {item.helper}</p>}
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

                    <div className="space-y-3">
                      {[
                        { key: "branch" as const, label: this.t.reportFilterBranch, count: selectedBranches.length },
                        { key: "coreValue" as const, label: this.state.lang === "th" ? "กรองตามค่านิยม" : "Core Value", count: selectedCoreValues.length },
                        { key: "year" as const, label: this.t.reportFilterYear, count: selectedYears.length },
                        { key: "people" as const, label: this.t.reportFilterPeople, count: selectedPeople.length },
                      ].map((filter) => (
                        <button key={filter.key} type="button" onClick={() => this.setState({ filterModal: filter.key })} className="flex w-full items-center justify-between rounded-2xl border-[1.5px] border-amber-300 bg-white px-4 py-4 text-left transition hover:border-amber-400 hover:bg-amber-50">
                          <span className="text-lg font-semibold text-slate-800">{filter.label}</span>
                          <span className="flex items-center gap-2">
                            {filter.count > 0 && <span className="grid h-7 min-w-7 place-items-center rounded-full bg-teal-800 px-2 text-sm font-bold text-white">{filter.count}</span>}
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="hidden">
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
                        <p className="mb-3 text-lg font-semibold uppercase tracking-wide text-slate-500">Core Value</p>
                        <div className="flex flex-wrap gap-2">
                          {COMMENT_TYPES.map((value) => {
                            const active = this.state.selectedCoreValues.includes(value);
                            return <button key={value} type="button" onClick={() => this.toggleCoreValue(value)} className={`rounded-full border px-3 py-2 text-sm font-semibold ${active ? "border-teal-800 bg-teal-800 text-white" : "border-amber-300 bg-white text-slate-700"}`}>{COMMENT_TYPE_META[value].emoji} {this.state.lang === "th" ? COMMENT_TYPE_META[value].th : COMMENT_TYPE_META[value].en}</button>;
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="mb-3 text-lg font-semibold uppercase tracking-wide text-slate-500">
                          {this.t.reportFilterYear}
                        </p>
                        <Select
                          value={selectedYears[0] || ""}
                          onChange={() => undefined}
                          options={[
                            { value: "", label: this.t.historyAllYears },
                            ...sortedYears.map((year) => ({ value: String(year), label: String(year) })),
                          ]}
                        />
                      </div>

                      <div>
                        <p className="mb-3 text-lg font-semibold uppercase tracking-wide text-slate-500">
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
                        <div className="rounded-2xl border-[1.5px] border-amber-300 bg-white/70 p-1.5">
                          <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl p-1">
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
                    </div>

                    <Modal open={this.state.filterModal === "branch"} onClose={() => this.setState({ filterModal: null })} title={this.t.reportFilterBranch}>
                      <div className="mb-4 flex items-center justify-between rounded-2xl bg-teal-50 px-4 py-3">
                        <p className="font-semibold text-teal-950">{this.state.lang === "th" ? `เลือกแล้ว ${selectedBranches.length} สาขา` : `${selectedBranches.length} branches selected`}</p>
                        <button type="button" onClick={() => this.setState({ selectedBranches: [] })} disabled={!selectedBranches.length} className="text-sm font-bold text-rose-600 disabled:opacity-40">{this.state.lang === "th" ? "ล้างทั้งหมด" : "Clear all"}</button>
                      </div>
                      <div className="grid max-h-[55vh] gap-2 overflow-y-auto pr-2 [scrollbar-gutter:stable] sm:grid-cols-2">
                        {(data?.branches || []).map((branch) => { const active = selectedBranches.includes(branch); return <button key={branch} type="button" onClick={() => this.toggleBranch(branch)} className={`flex min-h-12 items-center justify-between rounded-2xl border-[1.5px] px-4 py-3 text-left font-semibold transition ${active ? "border-teal-800 bg-teal-800 text-white shadow-sm" : "border-amber-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50"}`}><span className="truncate">{branch}</span><span className={`ml-3 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${active ? "border-amber-300 bg-amber-300 text-teal-950" : "border-slate-300 text-transparent"}`}>✓</span></button>; })}
                      </div>
                    </Modal>
                    <Modal open={this.state.filterModal === "coreValue"} onClose={() => this.setState({ filterModal: null })} title={this.state.lang === "th" ? "กรองตามค่านิยม" : "Core Value"}>
                      <div className="mb-4 flex items-center justify-between rounded-2xl bg-teal-50 px-4 py-3"><p className="font-semibold text-teal-950">{this.state.lang === "th" ? `เลือกแล้ว ${selectedCoreValues.length} ค่านิยม` : `${selectedCoreValues.length} values selected`}</p><button type="button" onClick={() => this.setState({ selectedCoreValues: [] })} disabled={!selectedCoreValues.length} className="text-sm font-bold text-rose-600 disabled:opacity-40">{this.state.lang === "th" ? "ล้างทั้งหมด" : "Clear all"}</button></div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {COMMENT_TYPES.map((value) => { const active = selectedCoreValues.includes(value); const meta = COMMENT_TYPE_META[value]; return <button key={value} type="button" onClick={() => this.toggleCoreValue(value)} className={`flex min-h-16 items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left transition ${active ? "border-teal-800 bg-teal-800 text-white shadow-sm" : "border-amber-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50"}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/80 text-xl">{meta.emoji}</span><span className="flex-1 font-semibold">{this.state.lang === "th" ? meta.th : meta.en}</span><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${active ? "border-amber-300 bg-amber-300 text-teal-950" : "border-slate-300 text-transparent"}`}>✓</span></button>; })}
                      </div>
                    </Modal>
                    <Modal open={this.state.filterModal === "year"} onClose={() => this.setState({ filterModal: null })} title={this.t.reportFilterYear}>
                      <div className="mb-4 flex items-center justify-between rounded-2xl bg-teal-50 px-4 py-3"><p className="font-semibold text-teal-950">{this.state.lang === "th" ? `เลือกแล้ว ${selectedYears.length} ปี` : `${selectedYears.length} years selected`}</p><button type="button" onClick={() => this.setState({ selectedYears: [] })} disabled={!selectedYears.length} className="text-sm font-bold text-rose-600 disabled:opacity-40">{this.state.lang === "th" ? "ล้างทั้งหมด" : "Clear all"}</button></div>
                      <div className="grid max-h-[55vh] gap-2 overflow-y-auto pr-2 [scrollbar-gutter:stable] sm:grid-cols-2">{sortedYears.map((year) => { const value = String(year); const active = selectedYears.includes(value); return <button type="button" key={year} onClick={() => this.setState((state) => ({ selectedYears: active ? state.selectedYears.filter((item) => item !== value) : [...state.selectedYears, value].sort((a, b) => Number(b) - Number(a)) }))} className={`flex min-h-14 items-center justify-between rounded-2xl border-[1.5px] px-4 py-3 font-semibold transition ${active ? "border-teal-800 bg-teal-800 text-white shadow-sm" : "border-amber-300 bg-gradient-to-r from-white to-amber-50/50 text-slate-700 hover:border-amber-400 hover:shadow-sm"}`}><span className="text-xl font-bold tabular-nums">{year}</span><span className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${active ? "border-amber-300 bg-amber-300 text-teal-950" : "border-slate-300 text-transparent"}`}>✓</span></button>; })}</div>
                    </Modal>
                    <Modal open={this.state.filterModal === "people"} onClose={() => this.setState({ filterModal: null })} title={this.t.reportFilterPeople}>
                      <div className="mb-4 flex items-center justify-between rounded-2xl bg-teal-50 px-4 py-3"><p className="font-semibold text-teal-950">{this.state.lang === "th" ? `เลือกแล้ว ${selectedPeople.length} คน` : `${selectedPeople.length} people selected`}</p><button type="button" onClick={() => this.setState({ selectedPeople: [], query: "" })} disabled={!selectedPeople.length && !query} className="text-sm font-bold text-rose-600 disabled:opacity-40">{this.state.lang === "th" ? "ล้างทั้งหมด" : "Clear all"}</button></div>
                      <div className="relative mb-4"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-700" /><input type="text" placeholder={reportLabels.searchPeople} value={query} onChange={(e) => this.setState({ query: e.target.value })} className="app-input h-[3.25rem] w-full rounded-2xl border-amber-300 py-3 pl-12 pr-4 text-base" /></div>
                      <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-2 [scrollbar-gutter:stable]">
                        {employees.map((employee) => { const active = selectedPeople.includes(employee.user_id); return <button type="button" key={employee.user_id} onClick={() => this.togglePerson(employee.user_id)} className={`flex w-full items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left transition ${active ? "border-teal-800 bg-teal-800 text-white" : "border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold ${active ? "bg-white/15 text-white" : "bg-teal-50 text-teal-800"}`}>{employee.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{employee.name}</span><span className={`block truncate text-sm ${active ? "text-teal-100" : "text-slate-500"}`}>{employee.branch}</span></span><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${active ? "border-amber-300 bg-amber-300 text-teal-950" : "border-slate-300 text-transparent"}`}>✓</span></button>; })}
                        {employees.length === 0 && <div className="rounded-2xl border border-dashed border-amber-300 py-10 text-center text-slate-500">{this.state.lang === "th" ? "ไม่พบรายชื่อที่ค้นหา" : "No people found"}</div>}
                      </div>
                    </Modal>
                  </aside>

                  <section className="app-panel min-w-0 overflow-hidden rounded-3xl">
                    <div className="flex flex-col gap-3 border-b-[1.5px] border-amber-300 p-5 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-3xl font-semibold text-slate-900">{reportLabels.results}</h2>
                          <span className="app-chip rounded-full px-3 py-1 text-lg font-semibold">
                            {displayRows.length} {reportLabels.rows}
                          </span>
                        </div>
                        <p className="mt-1 text-base text-slate-500">
                          {activeFilterCount > 0 ? `${activeFilterCount} ${reportLabels.activeFilters}` : reportLabels.noActiveFilters}
                        </p>
                      </div>
                      {filterStatusGroups.length > 0 ? (
                        <div className="w-full rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/70 p-3 shadow-sm xl:max-w-[48rem]">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                              <Filter className="h-4 w-4 text-teal-700" />
                              {reportLabels.activeFilters}
                            </span>
                            <span className="rounded-full bg-teal-800 px-2.5 py-1 text-xs font-bold text-white">
                              {activeFilterCount}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {filterStatusGroups.map((group) => {
                              const visibleItems = group.items.slice(0, 3);
                              const remainingCount = group.items.length - visibleItems.length;
                              return (
                                <div key={group.key} className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 p-1.5">
                                  <span className="shrink-0 px-1.5 text-xs font-bold text-slate-500">{group.label}</span>
                                  {visibleItems.map((item) => (
                                    <span key={item} className={`max-w-48 truncate rounded-lg border px-2.5 py-1 text-xs font-semibold ${group.className}`} title={item}>
                                      {item}
                                    </span>
                                  ))}
                                  {remainingCount > 0 ? (
                                    <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                                      +{remainingCount}
                                    </span>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500">
                          <Filter className="h-4 w-4" />
                          {reportLabels.noActiveFilters}
                        </div>
                      )}
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
                              <th className="whitespace-nowrap px-4 py-3">{this.state.lang === "th" ? "ผู้รับ" : "Recipients"}</th>
                              <th className="whitespace-nowrap px-4 py-3">{this.state.lang === "th" ? "สาขา" : "Branch"}</th>
                              <th className="whitespace-nowrap px-4 py-3">{this.state.lang === "th" ? "ค่านิยม" : "Core Value"}</th>
                              <th className="whitespace-nowrap px-4 py-3">{this.state.lang === "th" ? "ข้อความชื่นชม" : "Comment"}</th>
                              <th className="whitespace-nowrap px-4 py-3">{this.state.lang === "th" ? "ผู้ส่ง" : "Given By"}</th>
                              <th className="whitespace-nowrap px-4 py-3">{this.state.lang === "th" ? "วันที่" : "Date"}</th>
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
