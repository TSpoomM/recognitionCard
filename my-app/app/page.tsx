'use client';

import { Component, FormEvent } from "react";
import { CommentType } from "./types/commentType";
import { PendingSubmission } from "./types/pendingSubmission";
import { HomeState } from "./types/homeState";
import { User } from "./types/user";
import { CardLanguage } from "./types/cardLanguage";
import { Language, TRANSLATIONS } from "./constants/translations";
import { getInitialLanguage, LanguageContext, persistLanguage } from "./context/LanguageContext";
import RecognitionStepper from "./components/features/recognition/Stepper";
import RecognitionHeader from "./components/features/recognition/RecognitionHeader";
import RecognitionUserStep from "./components/features/userSelected/RecognitionUserStep";
import RecognitionCommentStep from "./components/features/starComment/RecognitionCommentStep";
import CoreValueSelect from "./components/features/coreValue/CoreValueSelect";
import FormMessages from "./components/features/recognition/FormMessages";
import FormActions from "./components/features/recognition/FormActions";
import RecognitionQueueButton from "./components/features/recognition/QueueButton";
import Card from "./components/ui/Card";
import Navbar from "./components/ui/Navbar";
import { RecognitionEngine } from "./lib/RecognitionEngine";
import { getClientCurrentUserId, isSameUserId } from "./lib/currentUser";
import { STAR_COMMENT_MAX_LENGTH, STAR_COMMENT_MIN_LENGTH, STAR_SECTION_MIN_LENGTH } from "./constants/recognitionFlow";
import { logRecognitionAction } from "./lib/recognitionLog";

type PageState = HomeState & { lang: Language };
type StarSectionKey = "s" | "t" | "a" | "r";

const STAR_SECTION_LABELS: Record<StarSectionKey, string> = {
  s: "Situation",
  t: "Task",
  a: "Action",
  r: "Result",
};

export default class Home extends Component<Record<string, never>, PageState> {
  private intervalId: number | null = null;
  private sendingSubmissionIds = new Set<string>();

  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      lang: 'th',
      currentStep: 1,
      currentUserId: "",
      users: [],
      isLoadingUsers: true,
      selectedUserIds: [],
      selectedTypes: [],
      selectedCardLanguage: 'th',
      comment: "",
      searchQuery: "",
      selectedBranch: "",
      pendingSubmissions: [],
      editingId: null,
      formError: "",
      formSuccess: "",
    };
  }

  private get t() {
    return TRANSLATIONS[this.state.lang];
  }

  private get selectedUsers() {
    return this.state.users.filter((user) =>
      this.state.selectedUserIds.includes(user.user_id) &&
      !isSameUserId(user.user_id, this.state.currentUserId)
    );
  }

  private get availableBranches() {
    const branches = new Set(
      this.state.users
        .filter(user => !isSameUserId(user.user_id, this.state.currentUserId))
        .map(user => user.location)
        .filter((location): location is string => !!location)
    );
    return Array.from(branches).sort();
  }

  private get filteredUsers() {
    const query = this.state.searchQuery.toLowerCase();
    const { selectedBranch } = this.state;

    return this.state.users.filter((user) => {
      if (isSameUserId(user.user_id, this.state.currentUserId)) return false;

      if (selectedBranch && user.location !== selectedBranch) return false;

      return (
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.team?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  }

  private get commentLength() {
    const sections = this.starSections;
    return (Object.keys(sections) as StarSectionKey[]).reduce((total, key) => total + sections[key].trim().length, 0);
  }

  private get starSections(): Record<StarSectionKey, string> {
    const sections: Record<StarSectionKey, string> = { s: "", t: "", a: "", r: "" };

    if (!this.state.comment.trim()) {
      return sections;
    }

    const sectionMap: Record<string, StarSectionKey> = {
      S: "s",
      T: "t",
      A: "a",
      R: "r",
    };
    let currentSection: StarSectionKey | null = null;

    this.state.comment.split(/\n/).forEach((line) => {
      const match = line.match(/^(S|T|A|R)\s*[:\-]?\s*(.*)$/i);

      if (match) {
        const key = sectionMap[match[1].toUpperCase()];
        if (key) {
          sections[key] = match[2];
          currentSection = key;
          return;
        }
      }

      if (currentSection) {
        sections[currentSection] = `${sections[currentSection]}${sections[currentSection] ? "\n" : ""}${line}`;
      }
    });

    return sections;
  }

  private get firstInvalidStarSection() {
    const sections = this.starSections;
    return (Object.keys(sections) as StarSectionKey[]).find((key) => sections[key].trim().length < STAR_SECTION_MIN_LENGTH) ?? null;
  }

  componentDidMount() {
    const initialLang = getInitialLanguage();
    const currentUserId = getClientCurrentUserId();
    this.setState({ lang: initialLang, selectedCardLanguage: initialLang, currentUserId });
    logRecognitionAction("step1", currentUserId);
    this.loadUsers();
    this.setState({
      pendingSubmissions: RecognitionEngine.loadSubmissions(),
    });

    this.intervalId = window.setInterval(() => {
      this.confirmExpiredSubmissions();
    }, 1000);
  }

  componentWillUnmount() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }
  }

  private persistSubmissions(submissions: PendingSubmission[]) {
    this.setState({ pendingSubmissions: submissions });
    RecognitionEngine.saveSubmissions(submissions);
  }

  private async loadUsers() {
    try {
      const response = await fetch("/api/employees");
      const result = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.error || "Could not load employee data.");
      }

      const rawDraft = window.sessionStorage.getItem("recognition-forward-draft");
      const draft = rawDraft ? JSON.parse(rawDraft) as { comment: string; coreValues: CommentType[]; cardLanguage: CardLanguage } : null;
      if (draft) window.sessionStorage.removeItem("recognition-forward-draft");
      if (draft) {
        this.setState({ users: result.data as User[], isLoadingUsers: false, formError: "", currentStep: 1, selectedUserIds: [], selectedTypes: draft.coreValues, comment: draft.comment, selectedCardLanguage: draft.cardLanguage });
      } else {
        this.setState({ users: result.data as User[], isLoadingUsers: false, formError: "" });
      }
    } catch (error) {
      this.setState({
        users: [],
        isLoadingUsers: false,
        formError: this.t.errorLoadUsers(error instanceof Error ? error.message : String(error)),
      });
    }
  }

  private async sendSubmission(submission: PendingSubmission) {
    const { currentUserId } = this.state;

    if (!currentUserId) {
      this.setState({
        formError: this.t.errorNoUserId,
        formSuccess: "",
      });
      return;
    }

    if (this.sendingSubmissionIds.has(submission.id)) return;
    this.sendingSubmissionIds.add(submission.id);

    try {
      const response = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diary_emp_ids: submission.users.map((user) => user.user_id),
          diary_comment: submission.comment,
          diary_corevalue: submission.types.join(", "),
          cardLanguage: submission.cardLanguage,
          createdBy: currentUserId,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(result?.error || "Could not save recognition card.");
      }

      const next = this.state.pendingSubmissions.filter((item) => item.id !== submission.id);
      this.persistSubmissions(next);
      this.setState({ formError: "", formSuccess: this.t.successSaved });
    } catch (error) {
      this.setState({
        formError: this.t.errorSaveCard(error instanceof Error ? error.message : String(error)),
        formSuccess: "",
      });
    } finally {
      this.sendingSubmissionIds.delete(submission.id);
    }
  }

  private confirmExpiredSubmissions() {
    const next = this.state.pendingSubmissions.map((submission) => {
      if (submission.id === this.state.editingId) return submission;
      return RecognitionEngine.updatePendingStatuses([submission])[0];
    });
    const expired = next.filter((submission, index) =>
      submission.id !== this.state.editingId &&
      submission.status === "sent" &&
      this.state.pendingSubmissions[index]?.status === "pending"
    );

    expired.forEach((submission) => {
      this.sendSubmission(submission);
    });
  }

  private handleToggleUser = (userId: string) => {
    if (isSameUserId(userId, this.state.currentUserId)) {
      this.setState({ formError: this.t.errorSelfRecognize, formSuccess: "" });
      return;
    }

    this.setState((currentState) => {
      const selectedUserIds = currentState.selectedUserIds.includes(userId)
        ? currentState.selectedUserIds.filter((id) => id !== userId)
        : [...currentState.selectedUserIds, userId];
      return { selectedUserIds, formError: "", formSuccess: "" };
    });
  };

  private handleSearchChange = (value: string) => {
    this.setState({ searchQuery: value });
  };

  private handleToggleType = (type: CommentType) => {
    this.setState((currentState) => {
      const selectedTypes = currentState.selectedTypes.includes(type)
        ? currentState.selectedTypes.filter((item) => item !== type)
        : [...currentState.selectedTypes, type];
      return { selectedTypes, formError: "", formSuccess: "" };
    });
  };

  private handleCommentChange = (comment: string) => {
    this.setState({ comment, formError: "", formSuccess: "" });
  };

  private resetForm = () => {
    this.setState({
      currentStep: 1,
      selectedUserIds: [],
      selectedTypes: [],
      selectedCardLanguage: this.state.lang,
      comment: "",
      searchQuery: "",
      selectedBranch: "",
      editingId: null,
      formError: "",
      formSuccess: "",
    });
  };

  private validateStep(step: number) {
    const { t } = this;

    if (!this.state.currentUserId) {
      this.setState({ formError: t.errorNoUserId, formSuccess: "" });
      return false;
    }

    if (step === 1 && this.state.selectedUserIds.length === 0) {
      this.setState({ formError: t.errorSelectUser, formSuccess: "" });
      return false;
    }

    if (step === 1 && this.state.selectedUserIds.some((id) => isSameUserId(id, this.state.currentUserId))) {
      this.setState({ formError: t.errorSelfRecognize, formSuccess: "" });
      return false;
    }

    if (step === 2 && this.state.selectedTypes.length === 0) {
      this.setState({ formError: t.errorSelectCoreValue, formSuccess: "" });
      return false;
    }

    this.setState({ formError: "", formSuccess: "" });
    return true;
  }

  private handleNextStep = () => {
    const { currentStep } = this.state;
    if (currentStep === 1 && !this.validateStep(1)) return;
    if (currentStep === 2 && !this.validateStep(2)) return;

    const nextStep = Math.min(4, currentStep + 1);
    this.setState({ currentStep: nextStep });
    logRecognitionAction(`step${nextStep}`, this.state.currentUserId);
  };

  private handlePrevStep = () => {
    const previousStep = Math.max(1, this.state.currentStep - 1);
    this.setState({
      formError: "",
      currentStep: previousStep,
    });
    logRecognitionAction(`step${previousStep}`, this.state.currentUserId);
  };

  private submitRecognition = () => {
    const { selectedUserIds, selectedTypes, selectedCardLanguage, comment, editingId, pendingSubmissions, currentUserId, lang } = this.state;
    const { t } = this;

    if (!currentUserId) {
      this.setState({ currentStep: 1, formError: t.errorNoUserId, formSuccess: "" });
      return;
    }

    if (selectedUserIds.length === 0) {
      this.setState({ currentStep: 1, formError: t.errorNoUser, formSuccess: "" });
      return;
    }

    if (selectedUserIds.some((id) => isSameUserId(id, currentUserId))) {
      this.setState({ currentStep: 1, formError: t.errorSelfRecognize, formSuccess: "" });
      return;
    }

    if (selectedTypes.length === 0) {
      this.setState({ currentStep: 2, formError: t.errorSelectCoreValue, formSuccess: "" });
      return;
    }

    const invalidStarSection = this.firstInvalidStarSection;
    if (invalidStarSection) {
      const label = STAR_SECTION_LABELS[invalidStarSection];
      const formError = lang === "th"
        ? `${label} ต้องมีอย่างน้อย ${STAR_SECTION_MIN_LENGTH} ตัวอักษร`
        : `${label} must be at least ${STAR_SECTION_MIN_LENGTH} characters.`;
      this.setState({ currentStep: 3, formError, formSuccess: "" });
      return;
    }

    if (this.commentLength < STAR_COMMENT_MIN_LENGTH) {
      this.setState({ currentStep: 3, formError: t.errorCommentTooShort(this.commentLength), formSuccess: "" });
      return;
    }

    if (this.commentLength > STAR_COMMENT_MAX_LENGTH) {
      this.setState({ currentStep: 3, formError: t.errorCommentTooLong(this.commentLength), formSuccess: "" });
      return;
    }

    if (editingId) {
      const updated = pendingSubmissions.map((submission) =>
        submission.id === editingId
          ? { ...submission, users: this.selectedUsers, types: selectedTypes, cardLanguage: selectedCardLanguage, comment, createdAt: Date.now(), status: "pending" as const }
          : submission
      );
      this.persistSubmissions(updated);
      this.setState({
        currentStep: 1,
        selectedUserIds: [],
        selectedTypes: [],
        selectedCardLanguage: this.state.lang,
        comment: "",
        searchQuery: "",
        editingId: null,
        formError: "",
        formSuccess: t.successUpdated,
      });
      return;
    }

    const newSubmission = RecognitionEngine.createPendingSubmission(this.selectedUsers, selectedTypes, comment, selectedCardLanguage);
    logRecognitionAction("sendRecog", currentUserId);
    this.persistSubmissions([newSubmission, ...pendingSubmissions]);
    this.setState({
      currentStep: 1,
      selectedUserIds: [],
      selectedTypes: [],
      selectedCardLanguage: this.state.lang,
      comment: "",
      searchQuery: "",
      editingId: null,
      formError: "",
      formSuccess: t.successQueued,
    });
  };

  private handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  private handleEditPending = (submission: PendingSubmission) => {
    logRecognitionAction("editRecog", this.state.currentUserId);
    this.setState({
      selectedUserIds: submission.users.map((user) => user.user_id),
      selectedTypes: submission.types,
      selectedCardLanguage: submission.cardLanguage,
      comment: submission.comment,
      editingId: submission.id,
      formError: "",
      formSuccess: "",
      selectedBranch: "",
      currentStep: 1,
    });
  };

  private handleDeletePending = (submissionId: string) => {
    logRecognitionAction("deleteRecog", this.state.currentUserId);
    const next = this.state.pendingSubmissions.filter((item) => item.id !== submissionId);
    this.persistSubmissions(next);

    if (this.state.editingId === submissionId) {
      this.resetForm();
    }
  };

  private handleConfirmPending = (submissionId: string) => {
    const { pendingSubmissions, editingId } = this.state;

    if (editingId === submissionId) {
      this.setState({
        formError: "Finish updating this card before confirming it.",
        formSuccess: "",
      });
      return;
    }

    const submission = pendingSubmissions.find((item) => item.id === submissionId);
    if (submission) {
      logRecognitionAction("confirmRecog", this.state.currentUserId);
      this.sendSubmission(submission);
    }
  };

  private handleSetLang = (lang: Language) => {
    persistLanguage(lang);
    this.setState({ lang, selectedCardLanguage: lang });
  };

  private handleCardLanguageChange = (selectedCardLanguage: CardLanguage) => {
    this.setState({ selectedCardLanguage, formError: "", formSuccess: "" });
  };

  private renderCardLanguageStep() {
    const { lang, selectedCardLanguage } = this.state;
    const isThai = lang === "th";
    const options: { value: CardLanguage; title: string; description: string }[] = [
      {
        value: "th",
        title: isThai ? "ภาษาไทย" : "Thai",
        description: isThai ? "ส่งรูปบัตรส่งต่อคุณค่าเป็นภาษาไทย" : "Send the recognition card image in Thai.",
      },
      {
        value: "en",
        title: isThai ? "ภาษาอังกฤษ" : "English",
        description: isThai ? "ส่งรูปบัตรส่งต่อคุณค่าเป็นภาษาอังกฤษ" : "Send the recognition card image in English.",
      },
    ];

    return (
      <>
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">{isThai ? "เลือกภาษาของบัตร" : "Choose card language"}</h2>
        <p className="mb-4 text-base text-slate-600">
          {isThai ? "เลือกภาษาที่จะแสดงในรูปการ์ดที่ส่งทางอีเมล" : "Select the language that will appear in the email card image."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {options.map((option) => {
            const active = selectedCardLanguage === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => this.handleCardLanguageChange(option.value)}
                className={`flex min-h-32 items-start justify-between gap-4 rounded-3xl border-[1.5px] p-5 text-left transition ${active
                  ? "border-amber-400 bg-teal-50/70 shadow-sm ring-2 ring-amber-100"
                  : "border-amber-300 bg-white text-slate-900 hover:border-amber-400 hover:bg-amber-50/30"
                  }`}
              >
                <span>
                  <span className="block text-xl font-bold text-slate-950">{option.title}</span>
                  <span className="mt-2 block text-base leading-7 text-slate-600">{option.description}</span>
                </span>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-[1.5px] text-sm font-bold ${active ? "border-amber-400 bg-teal-600 text-white" : "border-amber-300 bg-white text-slate-300"}`}>
                  ✓
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  private renderCurrentStep() {
    const {
      currentStep,
      selectedUserIds,
      selectedTypes,
      searchQuery,
      comment,
      isLoadingUsers,
    } = this.state;
    const { t } = this;

    if (currentStep === 1) {
      if (isLoadingUsers) {
        return (
          <>
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">{t.step1Title}</h2>
            <p className="text-base text-slate-600">{t.step1Loading}</p>
          </>
        );
      }

      return (
        <RecognitionUserStep
          filteredUsers={this.filteredUsers}
          selectedUsers={this.selectedUsers}
          selectedUserIds={selectedUserIds}
          searchQuery={searchQuery}
          selectedBranch={this.state.selectedBranch}
          availableBranches={this.availableBranches}
          onSearchChange={this.handleSearchChange}
          onToggleUser={this.handleToggleUser}
          onBranchChange={(branch) => this.setState({ selectedBranch: branch })}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <>
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">{t.step2Title}</h2>
          <p className="mb-4 text-base text-slate-600">{t.step2Description}</p>
          <CoreValueSelect
            selectedTypes={selectedTypes}
            onToggleType={this.handleToggleType}
          />
        </>
      );
    }

    if (currentStep === 3) {
      return (
        <RecognitionCommentStep
          users={this.selectedUsers}
          selectedTypes={selectedTypes}
          comment={comment}
          commentLength={this.commentLength}
          minLength={STAR_COMMENT_MIN_LENGTH}
          sectionMinLength={STAR_SECTION_MIN_LENGTH}
          maxLength={STAR_COMMENT_MAX_LENGTH}
          onCommentChange={this.handleCommentChange}
        />
      );
    }

    return this.renderCardLanguageStep();
  }

  render() {
    const { currentStep, currentUserId, formError, formSuccess, lang } = this.state;
    const { t } = this;

    return (
      <LanguageContext.Provider
        value={{
          lang,
          t: TRANSLATIONS[lang],
          setLang: this.handleSetLang,
        }}
      >
        <Navbar currentUserId={currentUserId} />
        {/* {JSON.stringify({ currentUserId, clientCurrentUserId: getClientCurrentUserId() })} */}
        <div className="app-page-shell">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            <aside className="lg:sticky lg:top-24">
              <RecognitionStepper currentStep={currentStep} steps={t.stepLabels as unknown as string[]} />
            </aside>

            <main className="min-w-0">
              <Card bordered={false} padding="xl" shadow="xl" className="app-surface mb-10">
                <RecognitionHeader currentUserId={currentUserId} />


                <form onSubmit={this.handleSubmit} className="space-y-8">
                  <div className="app-panel rounded-3xl p-5 sm:p-6">
                    {this.renderCurrentStep()}
                  </div>

                  <FormMessages
                    error={formError}
                    success={formSuccess}
                    onClearError={() => this.setState({ formError: "" })}
                    onClearSuccess={() => this.setState({ formSuccess: "" })}
                  />
                  <FormActions
                    currentStep={currentStep}
                    totalSteps={4}
                    onPrevStep={this.handlePrevStep}
                    onNextStep={this.handleNextStep}
                    onSubmitRecognition={() => {
                      this.submitRecognition();
                    }}
                  />
                </form>
              </Card>
            </main>
          </div>
          <RecognitionQueueButton
            submissions={this.state.pendingSubmissions}
            editingSubmissionId={this.state.editingId}
            onEditPending={this.handleEditPending}
            onDeletePending={this.handleDeletePending}
            onConfirmPending={this.handleConfirmPending}
          />
        </div>
      </LanguageContext.Provider>
    );
  }
}
