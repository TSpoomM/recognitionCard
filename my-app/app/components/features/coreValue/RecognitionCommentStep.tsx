'use client';

import { ChangeEvent, Component } from "react";
import { CommentType } from "../../../types/commentType";
import RecognitionCommentTypeSelect from "./RecognitionCommentTypeSelect";

type RecognitionCommentStepProps = {
  selectedTypes: CommentType[];
  comment: string;
  alphabetCount: number;
  onToggleType: (type: CommentType) => void;
  onCommentChange: (comment: string) => void;
};

export default class RecognitionCommentStep extends Component<RecognitionCommentStepProps> {
  private handleCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onCommentChange(event.target.value);
  };

  render() {
    const { selectedTypes, comment, alphabetCount, onToggleType } = this.props;

    return (
      <>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">2. Choose types</h2>
        <p className="mb-4 text-sm text-slate-600">
          Select one or more core values that fit.
        </p>
        <RecognitionCommentTypeSelect
          selectedTypes={selectedTypes}
          onToggleType={onToggleType}
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
            onChange={this.handleCommentChange}
            rows={7}
            placeholder="Write at least 70 letters here..."
            className="mt-4 min-h-[180px] w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </>
    );
  }
}
