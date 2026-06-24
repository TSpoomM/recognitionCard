'use client';

import { Component } from "react";
import Card from "../../ui/Card";

type RecognitionStepperProps = {
  currentStep: number;
  steps: string[];
};

export default class RecognitionStepper extends Component<RecognitionStepperProps> {
  render() {
    const { currentStep, steps } = this.props;

    return (
      <Card surface="muted" padding="lg" className="mb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Step {currentStep} of {steps.length}</h2>
            <p className="text-sm text-slate-600">Complete each step to submit your recognition card.</p>
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
                  className="flex items-center gap-3 text-sm min-w-0"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border font-semibold ${completed
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
