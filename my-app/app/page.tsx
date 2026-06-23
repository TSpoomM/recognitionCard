'use client';

import Link from "next/link";
import { Component, FormEvent } from "react";
import { User } from "./types/user";
import { CommentType } from "./types/commentType";
import { PendingSubmission } from "./types/pendingSubmission";
import RecognitionStepper from "./components/RecognitionStepper";
import RecognitionUserSelect from "./components/RecognitionUserSelect";
import RecognitionCommentTypeSelect from "./components/RecognitionCommentTypeSelect";
import RecognitionReviewSummary from "./components/RecognitionReviewSummary";
import RecognitionPendingPanel from "./components/RecognitionPendingPanel";
import { RecognitionEngine } from "./lib/RecognitionEngine";

const MOCK_USERS: User[] = [
  {
    user_id: "u-001",
    firstName: "Nina",
    lastName: "Patel",
    email: "nina.patel@example.com",
    photoUrl: "https://image.makewebeasy.net/makeweb/m_1200x600/si08IWcIs/attachfile/pig03.jpg",
    role: "Product Designer",
    team: "Design",
  },
  {
    user_id: "u-002",
    firstName: "Sam",
    lastName: "Rodriguez",
    email: "sam.rodriguez@example.com",
    photoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB6U38E_AnJ1-vP26V1zobaThA6HleTqywqICf1FqDDYwzqbQIwsFDRp9EvwHnXpoSiusolAxCv9etUDcuppxm77-xwOKaq3bc_iQZfA&s=10",
    role: "Product Designer",
    team: "Design",
  },
  {
    user_id: "u-003",
    firstName: "Mei",
    lastName: "Tanaka",
    email: "mei.tanaka@example.com",
    photoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5CHxFsm3oy6-RLHIH_86pJTJQG0NfBFwuL-VBlZ0RWEvR8S-I4_EdiLaUSpI3a7y5on6dzicBciZuQRkRALKG009wpZQHd8GnGCEsjQ&s=10",
    role: "Product Manager",
    team: "Product",
  },
  {
    user_id: "u-004",
    firstName: "Carlos",
    lastName: "Diaz",
    email: "carlos.diaz@example.com",
    photoUrl: "https://media.thairath.co.th/image/c47Jh7v31NfG8M7J0NgDNZ0f9nFkB1AYkhWIPlAI650e9vA1.png",
    role: "Backend Engineer",
    team: "Engineering",
  },
  {
    user_id: "u-005",
    firstName: "Asha",
    lastName: "Singh",
    email: "asha.singh@example.com",
    photoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSI1kH31DkEXCFtTCDm7rdhYY5YRNnxvnlnMQS_wvfKN8W5Ej18uOaivWj9a6bCjlM9HQwbFcBh5Td7RSE_n4niUn6OBaBozvNM6KDJ4U&s=10",
    role: "Marketing Lead",
    team: "Marketing",
  },
];

const STEPS = ["Choose people", "Choose types", "Write comment"];

type HomeState = {
  currentStep: number;
  selectedUserIds: string[];
  selectedTypes: CommentType[];
  comment: string;
  searchQuery: string;
  pendingSubmissions: PendingSubmission[];
  editingId: string | null;
  formError: string;
  formSuccess: string;
};

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
      return { selectedUserIds };
    });
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
    console.log(`validateStep: step ${step}`, {
      selectedUserIds: this.state.selectedUserIds,
      selectedTypes: this.state.selectedTypes,
      alphabetCount: this.alphabetCount,
    });

    if (step === 1 && this.state.selectedUserIds.length === 0) {
      this.setState({ formError: "Please choose at least one user to comment." });
      return false;
    }

    if (step === 2 && (this.state.selectedTypes.length === 0 || this.alphabetCount < 70)) {
      this.setState({ formError: "Please choose at least one core value and ensure your comment contains at least 70 alphabetic letters.", formSuccess: "" });
      return false;
    }

    this.setState({ formError: "", formSuccess: "" });
    return true;
  }

  private handleNextStep = () => {
    const { currentStep } = this.state;
    console.log("current step:", currentStep);
    if (currentStep === 1 && !this.validateStep(1)) return;
    if (currentStep === 2 && !this.validateStep(2)) return;
    this.setState(
      (state) => ({ currentStep: Math.min(3, state.currentStep + 1) }),
      () => console.log("step updated to:", this.state.currentStep)
    );
  };

  private handlePrevStep = () => {
    this.setState({ formError: "", currentStep: Math.max(1, this.state.currentStep - 1) });
  };

  private handleToggleType = (type: CommentType) => {
    this.setState((currentState) => {
      const selectedTypes = currentState.selectedTypes.includes(type)
        ? currentState.selectedTypes.filter((item) => item !== type)
        : [...currentState.selectedTypes, type];
      return { selectedTypes };
    });
  };

  private handleSearchChange = (value: string) => {
    this.setState({ searchQuery: value });
  };

  private handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { selectedUserIds, selectedTypes, comment } = this.state;

    // Check that all required data is present
    if (selectedUserIds.length === 0) {
      this.setState({ formError: "Please select at least one user." });
      return;
    }

    if (selectedTypes.length === 0) {
      this.setState({ formError: "Please select at least one core value." });
      return;
    }

    const alphabetCount = this.alphabetCount;
    if (alphabetCount < 70) {
      this.setState({ formError: `Please write at least 70 letters (currently ${alphabetCount}).` });
      return;
    }

    const currentUsers = MOCK_USERS.filter((user) => selectedUserIds.includes(user.user_id));

    if (this.state.editingId) {
      const updated = this.state.pendingSubmissions.map((submission) =>
        submission.id === this.state.editingId
          ? { ...submission, users: currentUsers, types: selectedTypes, comment }
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

    const newSubmission = RecognitionEngine.createPendingSubmission(currentUsers, selectedTypes, comment);
    this.persistSubmissions([newSubmission, ...this.state.pendingSubmissions]);
    this.setState({
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

  render() {
    const { currentStep, selectedUserIds, selectedTypes, searchQuery, comment, pendingSubmissions, formError } = this.state;
    const alphabetCount = RecognitionEngine.countAlphabetLetters(comment);
    const selectedUsers = MOCK_USERS.filter((user) => selectedUserIds.includes(user.user_id));
    const filteredUsers = MOCK_USERS.filter((user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.team?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/80 sm:p-10">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">Recognition Card</p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open dashboard
              </Link>
            </div>

            <div className="mb-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <RecognitionStepper currentStep={currentStep} steps={STEPS} />
            </div>

            <form onSubmit={this.handleSubmit} className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                {currentStep === 1 && (
                  <>
                    <h2 className="mb-4 text-xl font-semibold text-slate-900">1. Choose people</h2>
                    <p className="mb-6 text-sm text-slate-600">
                      Pick one or more teammates to recognize.
                    </p>
                    <div className="mb-4 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => this.handleSearchChange(event.target.value)}
                        placeholder="Search by name, team, role..."
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    {selectedUsers.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <button
                            key={user.user_id}
                            type="button"
                            onClick={() => this.handleToggleUser(user.user_id)}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-800"
                          >
                            {user.firstName} {user.lastName}
                            <span className="text-slate-300">×</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <RecognitionUserSelect
                      users={filteredUsers}
                      selectedUserIds={selectedUserIds}
                      onToggleUser={this.handleToggleUser}
                    />
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <h2 className="mb-4 text-xl font-semibold text-slate-900">2. Choose types</h2>
                    <p className="mb-4 text-sm text-slate-600">
                      Select one or more core values that fit.
                    </p>
                    <RecognitionCommentTypeSelect
                      selectedTypes={selectedTypes}
                      onToggleType={this.handleToggleType}
                    />
                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <label htmlFor="comment" className="text-base font-semibold text-slate-900">
                            S T A R
                          </label>
                          <p className="text-sm text-slate-600">
                            The comment must include at least 70 alphabetic letters.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-700">
                          {alphabetCount} letters
                        </div>
                      </div>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(event) => this.setState({ comment: event.target.value })}
                        rows={7}
                        placeholder="Write at least 70 letters here..."
                        className="mt-4 min-h-[180px] w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <h2 className="mb-4 text-xl font-semibold text-slate-900">3. Review & submit</h2>
                    <p className="mb-6 text-sm text-slate-600">
                      Confirm the details below before sending your recognition card into the pending queue.
                    </p>
                    <RecognitionReviewSummary users={selectedUsers} types={selectedTypes} comment={comment} />
                    <RecognitionPendingPanel
                      submissions={pendingSubmissions}
                      onEditPending={this.handleEditPending}
                      onDeletePending={this.handleDeletePending}
                    />
                  </>
                )}
              </div>

              {formError ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {formError}
                </div>
              ) : null}
              {this.state.formSuccess ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {this.state.formSuccess}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={this.handlePrevStep}
                  disabled={currentStep === 1}
                  className="inline-flex h-14 items-center justify-center rounded-3xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  Back
                </button>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={this.handleNextStep}
                    // disabled={(currentStep === 1 && selectedUserIds.length === 0) || (currentStep === 2 && alphabetCount < 70)}
                    className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={() => console.log("this.step:", this.state.currentStep)}
                    className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Submit recognition
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* <RecognitionPendingPanel
            submissions={pendingSubmissions}
            onEditPending={this.handleEditPending}
            onDeletePending={this.handleDeletePending}
          /> */}
      </div >
    );
  }
}

