'use client';

import { Component } from "react";
import Card from "../../ui/Card";
import { LanguageContext } from "../../../context/LanguageContext";

type RecognitionStepperProps = {
  currentStep: number;
  steps: string[];
};

export default class RecognitionStepper extends Component<RecognitionStepperProps> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  render() {
    const { currentStep, steps } = this.props;
    const { t } = this.context;

    return (
      <Card surface="muted" padding="lg" className="mb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{t.stepperTitle(currentStep, steps.length)}</h2>
            <p className="mt-1 text-base text-slate-600">{t.stepperDescription}</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
            {steps.map((label, index) => {
              const step = index + 1;
              const active = currentStep === step;
              const completed = currentStep > step;

              return (
                <Card
                  key={label}
                  padding="sm"
                  className="flex min-w-0 items-center gap-3 text-base"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border font-semibold ${completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-500"
                      }`}
                  >
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 whitespace-normal break-words">{label}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }
}
