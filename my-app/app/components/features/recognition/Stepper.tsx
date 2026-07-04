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
      <Card surface="muted" padding="lg" className="border-[1.5px] border-amber-300 bg-white/70 shadow-sm shadow-teal-900/5 backdrop-blur">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">{t.stepperTitle(currentStep, steps.length)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.stepperDescription}</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {steps.map((label, index) => {
              const step = index + 1;
              const active = currentStep === step;
              const completed = currentStep > step;

              return (
                <div
                  key={label}
                  className={`group relative flex min-w-0 items-center gap-3 rounded-2xl border p-4 text-base transition ${completed
                    ? "border-amber-300 bg-teal-50/90 text-teal-950"
                    : active
                      ? "border-amber-400 bg-white text-slate-950 shadow-md shadow-teal-900/10"
                      : "border-amber-300 bg-white/50 text-slate-600"
                    }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-semibold ${completed
                      ? "border-amber-400 bg-teal-500 text-white"
                      : active
                        ? "border-amber-400 bg-teal-800 text-white"
                        : "border-amber-300 bg-white text-slate-500"
                      }`}
                  >
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="whitespace-normal break-words font-semibold">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }
}
