'use client';

import { Component } from "react";
import Button from "../../ui/Button";

type RecognitionFormActionsProps = {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
};

export default class RecognitionFormActions extends Component<RecognitionFormActionsProps> {
  render() {
    const { currentStep, onPrevStep, onNextStep } = this.props;

    return (
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          onClick={onPrevStep}
          disabled={currentStep === 1}
          variant="secondary"
        >
          Back
        </Button>
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={onNextStep}
          >
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
          >
            Submit recognition
          </Button>
        )}
      </div>
    );
  }
}
