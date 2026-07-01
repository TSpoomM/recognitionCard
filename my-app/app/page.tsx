'use client';

import { Component, FormEvent } from "react";
import { CommentType } from "./types/commentType";
import { PendingSubmission } from "./types/pendingSubmission";
import { HomeState } from "./types/homeState";
import { User } from "./types/user";
import { Language, TRANSLATIONS } from "./constants/translations";
import { LanguageContext } from "./context/LanguageContext";
import RecognitionStepper from "./components/features/recognition/Stepper";
import RecognitionHeader from "./components/features/recognition/RecognitionHeader";
import RecognitionUserStep from "./components/features/userSelected/RecognitionUserStep";
import RecognitionCommentStep from "./components/features/starComment/RecognitionCommentStep";
import CoreValueSelect from "./components/features/coreValue/CoreValueSelect";
import FormMessages from "./components/features/recognition/FormMessages";
import FormActions from "./components/features/recognition/FormActions";
import RecognitionQueueButton from "./components/features/recognition/QueueButton";
import Card from "./components/ui/Card";
import { RecognitionEngine } from "./lib/RecognitionEngine";
import { getClientCurrentUserId, isSameUserId } from "./lib/currentUser";
import { STAR_COMMENT_MAX_LENGTH, STAR_COMMENT_MIN_LENGTH } from "./constants/recognitionFlow";

type PageState = HomeState & { lang: Language };

export default class Home extends Component<Record<string, never>, PageState> {
  private intervalId: number | null = null;
  private sendingSubmissionIds = new Set<string>();

  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      lang: 'en',
      currentStep: 1,
      currentUserId: getClientCurrentUserId(),
      users: [],
      isLoadingUsers: true,
      selectedUserIds: [],
      selectedTypes: [],
      comment: "",
      searchQuery: "",
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

  private get filteredUsers() {
    const query = this.state.searchQuery.toLowerCase();

    return this.state.users.filter((user) => {
      if (isSameUserId(user.user_id, this.state.currentUserId)) return false;

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
    return this.state.comment.trim().length;
  }

  componentDidMount() {
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

      this.setState({ users: result.data as User[], isLoadingUsers: false, formError: "" });
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
      await Promise.all(
        submission.users.map(async (user) => {
          const response = await fetch("/api/diary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              diary_emp_id: user.user_id,
              diary_comment: submission.comment,
              diary_corevalue: submission.types.join(", "),
              createdBy: currentUserId,
            }),
          });

          const result = await response.json().catch(() => null);
          if (!response.ok || result?.success === false) {
            throw new Error(result?.error || "Could not save recognition card.");
          }
        })
      );

      const next = this.state.pendingSubmissions.map((item) =>
        item.id === submission.id ? { ...item, status: "sent" as const } : item
      );
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
    const next = RecognitionEngine.updatePendingStatuses(this.state.pendingSubmissions);
    const expired = next.filter((submission, index) =>
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
    if (comment.trim().length > STAR_COMMENT_MAX_LENGTH) return;
    this.setState({ comment, formError: "", formSuccess: "" });
  };

  private resetForm = () => {
    this.setState({
      currentStep: 1,
      selectedUserIds: [],
      selectedTypes: [],
      comment: "",
      searchQuery: "",
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

    this.setState((state) => ({
      currentStep: Math.min(3, state.currentStep + 1),
    }));
  };

  private handlePrevStep = () => {
    this.setState({
      formError: "",
      currentStep: Math.max(1, this.state.currentStep - 1),
    });
  };

  private submitRecognition = () => {
    const { selectedUserIds, selectedTypes, comment, editingId, pendingSubmissions, currentUserId } = this.state;
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
          ? { ...submission, users: this.selectedUsers, types: selectedTypes, comment }
          : submission
      );
      this.persistSubmissions(updated);
      this.setState({
        currentStep: 1,
        selectedUserIds: [],
        selectedTypes: [],
        comment: "",
        searchQuery: "",
        editingId: null,
        formError: "",
        formSuccess: t.successUpdated,
      });
      return;
    }

    const newSubmission = RecognitionEngine.createPendingSubmission(this.selectedUsers, selectedTypes, comment);
    this.persistSubmissions([newSubmission, ...pendingSubmissions]);
    this.setState({
      currentStep: 1,
      selectedUserIds: [],
      selectedTypes: [],
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
    this.setState({
      selectedUserIds: submission.users.map((user) => user.user_id),
      selectedTypes: submission.types,
      comment: submission.comment,
      editingId: submission.id,
      formError: "",
      formSuccess: "",
      currentStep: 1,
    });
  };

  private handleDeletePending = (submissionId: string) => {
    const next = this.state.pendingSubmissions.filter((item) => item.id !== submissionId);
    this.persistSubmissions(next);

    if (this.state.editingId === submissionId) {
      this.resetForm();
    }
  };

  private handleConfirmPending = (submissionId: string) => {
    const submission = this.state.pendingSubmissions.find((item) => item.id === submissionId);
    if (submission) {
      this.sendSubmission(submission);
    }
  };

  private handleSetLang = (lang: Language) => {
    this.setState({ lang });
  };

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
          onSearchChange={this.handleSearchChange}
          onToggleUser={this.handleToggleUser}
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

    return (
      <RecognitionCommentStep
        users={this.selectedUsers}
        selectedTypes={selectedTypes}
        comment={comment}
        commentLength={this.commentLength}
        minLength={STAR_COMMENT_MIN_LENGTH}
        maxLength={STAR_COMMENT_MAX_LENGTH}
        onCommentChange={this.handleCommentChange}
      />
    );
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
        <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Card bordered={false} padding="xl" shadow="xl" className="mb-10">
              <RecognitionHeader currentUserId={currentUserId} />

              <RecognitionStepper currentStep={currentStep} steps={t.stepLabels as unknown as string[]} />

              <form onSubmit={this.handleSubmit} className="space-y-8">
                <Card padding="lg">
                  {this.renderCurrentStep()}
                </Card>

                <FormMessages error={formError} success={formSuccess} />
                <FormActions
                  currentStep={currentStep}
                  onPrevStep={this.handlePrevStep}
                  onNextStep={this.handleNextStep}
                  onSubmitRecognition={() => {
                    this.submitRecognition();
                  }}
                />
              </form>
            </Card>
          </div>
          <RecognitionQueueButton
            submissions={this.state.pendingSubmissions}
            onEditPending={this.handleEditPending}
            onDeletePending={this.handleDeletePending}
            onConfirmPending={this.handleConfirmPending}
          />
        </div>
      </LanguageContext.Provider>
    );
  }
}
