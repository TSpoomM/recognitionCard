'use client';

import { ButtonHTMLAttributes, Component, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export default class Button extends Component<ButtonProps> {
  private getVariantClassName(variant: ButtonVariant) {
    if (variant === "secondary") {
      return "border border-slate-300 bg-white text-slate-900 transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 hover:border-slate-400";
    }

    if (variant === "danger") {
      return "border border-red-300 bg-red-50 text-red-700 transition hover:bg-red-100";
    }

    return "bg-slate-950 text-white transition hover:bg-slate-800";
  }

  render() {
    const { children, className = "", variant = "primary", ...buttonProps } = this.props;

    return (
      <button
        {...buttonProps}
        className={`inline-flex h-14 items-center justify-center rounded-3xl px-6 text-sm font-semibold ${this.getVariantClassName(variant)} ${className}`}
      >
        {children}
      </button>
    );
  }
}
