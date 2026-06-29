'use client';

import { Component } from "react";
import Button from "../../ui/Button";

type FormActionsProps = {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmitRecognition: () => void;
};

export default class FormActions extends Component<FormActionsProps> {
  render() {
    const { currentStep, onPrevStep, onNextStep, onSubmitRecognition } = this.props;

    return (
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          onClick={onPrevStep}
          disabled={currentStep === 1}
          variant="secondary"
          className="text-base"
        >
          Back
        </Button>
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={onNextStep}
            className="text-base"
          >
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmitRecognition}
            className="text-base"
          >
            Submit recognition
          </Button>
        )}
      </div>
    );
  }
}
