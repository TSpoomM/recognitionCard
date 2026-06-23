'use client';

import { Component } from "react";
import { PendingSubmission } from "../../../types/pendingSubmission";
import RecognitionPendingPanel from "./RecognitionPendingPanel";

type RecognitionReviewStepProps = {
  submissions: PendingSubmission[];
  onEditPending: (submission: PendingSubmission) => void;
  onDeletePending: (submissionId: string) => void;
};

export default class RecognitionReviewStep extends Component<RecognitionReviewStepProps> {
  render() {
    const { submissions, onEditPending, onDeletePending } = this.props;

    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">3. Review & submit</h2>
        <p className="mb-6 text-sm text-slate-600">
          Confirm the details below before sending your recognition card into the pending queue.
        </p>
        <RecognitionPendingPanel
          submissions={submissions}
          onEditPending={onEditPending}
          onDeletePending={onDeletePending}
        />
      </>
    );
  }
}
