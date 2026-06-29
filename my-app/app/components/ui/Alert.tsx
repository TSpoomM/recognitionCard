'use client';

import { Component, ReactNode } from "react";
import Card from "./Card";

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

  render() {
    return (
      <Card padding="none" shadow="none" className={`px-4 py-3 text-base font-medium ${this.toneClassName}`}>
        {this.props.children}
      </Card>
    );
  }
}
