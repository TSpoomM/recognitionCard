'use client';

import { Component, FormEvent } from "react";
import { CommentType } from "./types/commentType";
import { PendingSubmission } from "./types/pendingSubmission";
import { HomeState } from "./types/homeState";
import { MOCK_USERS } from "./data/mockUsers";
import { RECOGNITION_STEPS } from "./constants/recognitionFlow";
import RecognitionStepper from "./components/features/recognition/RecognitionStepper";
import RecognitionHeader from "./components/features/recognition/RecognitionHeader";
import RecognitionUserStep from "./components/features/userSelected/RecognitionUserStep";
import RecognitionCommentStep from "./components/features/coreValue/RecognitionCommentStep";
import RecognitionReviewStep from "./components/features/pendingConfirm/RecognitionReviewStep";
import RecognitionFormMessages from "./components/features/recognition/RecognitionFormMessages";
import RecognitionFormActions from "./components/features/recognition/RecognitionFormActions";
import Card from "./components/ui/Card";
import { RecognitionEngine } from "./lib/RecognitionEngine";

export default class Home extends Component<Record<string, never>, HomeState> {
  private intervalId: number | null = null;

  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      currentStep: 1,
      selectedUserIds: [],
      selectedTypes: [],
      comment: "",
      searchQuery: "",
      pendingSubmissions: RecognitionEngine.loadSubmissions(),
      editingId: null,
      formError: "",
      formSuccess: "",
    };
  }

  private get selectedUsers() {
    return MOCK_USERS.filter((user) => this.state.selectedUserIds.includes(user.user_id));
  }

  private get filteredUsers() {
    const query = this.state.searchQuery.toLowerCase();

    return MOCK_USERS.filter((user) =>
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.team?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  private get alphabetCount() {
    return RecognitionEngine.countAlphabetLetters(this.state.comment);
  }

  componentDidMount() {
    this.intervalId = window.setInterval(() => {
      this.setState((currentState) => {
        const next = RecognitionEngine.updatePendingStatuses(currentState.pendingSubmissions);
        if (JSON.stringify(next) !== JSON.stringify(currentState.pendingSubmissions)) {
          RecognitionEngine.saveSubmissions(next);
          return { pendingSubmissions: next };
        }
        return null;
      });
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

  private handleToggleUser = (userId: string) => {
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
      comment: "",
      searchQuery: "",
      editingId: null,
      formError: "",
      formSuccess: "",
    });
  };

  private validateStep(step: number) {
    if (step === 1 && this.state.selectedUserIds.length === 0) {
      this.setState({ formError: "Please choose at least one user to comment.", formSuccess: "" });
      return false;
    }

    if (step === 2 && (this.state.selectedTypes.length === 0 || this.alphabetCount < 70)) {
      this.setState({
        formError: "Please choose at least one core value and ensure your comment contains at least 70 alphabetic letters.",
        formSuccess: "",
      });
      return false;
    }

    this.setState({ formError: "", formSuccess: "" });
    return true;
  }

  private handleNextStep = () => {
    const { currentStep } = this.state;
    if (currentStep === 1 && !this.validateStep(1)) return;
    if (currentStep === 2 && !this.validateStep(2)) return;

    this.setState((state) => ({ currentStep: Math.min(3, state.currentStep + 1) }));
  };

  private handlePrevStep = () => {
    this.setState({ formError: "", currentStep: Math.max(1, this.state.currentStep - 1) });
  };

  private handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { selectedUserIds, selectedTypes, comment, editingId, pendingSubmissions } = this.state;

    if (selectedUserIds.length === 0) {
      this.setState({
        currentStep: 1,
        formError: "Please select at least one user.",
        formSuccess: "",
      });
      return;
    }

    if (selectedTypes.length === 0) {
      this.setState({
        currentStep: 2,
        formError: "Please select at least one core value.",
        formSuccess: "",
      });
      return;
    }

    if (this.alphabetCount < 70) {
      this.setState({
        currentStep: 2,
        formError: `Please write at least 70 letters (currently ${this.alphabetCount}).`,
        formSuccess: "",
      });
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
        // currentStep: 1,
        selectedUserIds: [],
        selectedTypes: [],
        comment: "",
        searchQuery: "",
        editingId: null,
        formError: "",
        formSuccess: "Recognition card updated successfully.",
      });
      return;
    }

    const newSubmission = RecognitionEngine.createPendingSubmission(this.selectedUsers, selectedTypes, comment);
    this.persistSubmissions([newSubmission, ...pendingSubmissions]);
    this.setState({
      // currentStep: 1,
      selectedUserIds: [],
      selectedTypes: [],
      comment: "",
      searchQuery: "",
      editingId: null,
      formError: "",
      formSuccess: "Recognition card queued successfully.",
    });
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

  private renderCurrentStep() {
    const { currentStep, selectedUserIds, selectedTypes, searchQuery, comment, pendingSubmissions } = this.state;

    if (currentStep === 1) {
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
        <RecognitionCommentStep
          selectedTypes={selectedTypes}
          comment={comment}
          alphabetCount={this.alphabetCount}
          onToggleType={this.handleToggleType}
          onCommentChange={this.handleCommentChange}
        />
      );
    }

    return (
      <RecognitionReviewStep
        submissions={pendingSubmissions}
        onEditPending={this.handleEditPending}
        onDeletePending={this.handleDeletePending}
      />
    );
  }

  render() {
    const { currentStep, formError, formSuccess } = this.state;

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Card bordered={false} padding="xl" shadow="xl" className="mb-10">
            <RecognitionHeader />

            <RecognitionStepper currentStep={currentStep} steps={RECOGNITION_STEPS} />

            <form onSubmit={this.handleSubmit} className="space-y-8">
              <Card padding="lg">
                {this.renderCurrentStep()}
              </Card>

              <RecognitionFormMessages error={formError} success={formSuccess} />
              <RecognitionFormActions
                currentStep={currentStep}
                onPrevStep={this.handlePrevStep}
                onNextStep={this.handleNextStep}
              />
            </form>
          </Card>
        </div>
      </div>
    );
  }
}
