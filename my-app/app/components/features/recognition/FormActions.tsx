'use client';

import { Component } from "react";
import Button from "../../ui/Button";
import { LanguageContext } from "../../../context/LanguageContext";

type FormActionsProps = {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmitRecognition: () => void;
};

export default class FormActions extends Component<FormActionsProps> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  render() {
    const { currentStep, onPrevStep, onNextStep, onSubmitRecognition } = this.props;
    const { t } = this.context;

    return (
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          onClick={onPrevStep}
          disabled={currentStep === 1}
          variant="secondary"
          className="text-base"
        >
          {t.back}
        </Button>
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={onNextStep}
            className="text-base"
          >
            {t.continue}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmitRecognition}
            className="text-base"
          >
            {t.submitRecognition}
          </Button>
        )}
      </div>
    );
  }
}
