'use client';

import { Component, ReactNode } from "react";
import Card from "./Card";
import { AlertCircleIcon, CheckIcon } from "./Icons";

type AlertTone = "error" | "success";

type AlertProps = {
  children: ReactNode;
  tone: AlertTone;
};

export default class Alert extends Component<AlertProps> {
  private get toneClassName() {
    return this.props.tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  private get icon() {
    return this.props.tone === "error"
      ? <AlertCircleIcon className="h-5 w-5 flex-shrink-0" />
      : <CheckIcon className="h-5 w-5 flex-shrink-0" />;
  }

  render() {
    return (
      <Card padding="none" shadow="none" className={`px-4 py-3 text-base font-medium ${this.toneClassName}`}>
        <div className="flex items-center gap-3">
          {this.icon}
          <span>{this.props.children}</span>
        </div>
      </Card>
    );
  }
}