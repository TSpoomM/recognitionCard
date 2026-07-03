'use client';

import { ButtonHTMLAttributes, Component, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

export default class Button extends Component<ButtonProps> {
  private getVariantClassName(variant: ButtonVariant): string {
    switch (variant) {
      case "secondary":
        return "border border-slate-300 bg-white text-slate-900 transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 hover:border-slate-400 hover:bg-slate-50";
      case "danger":
        return "border border-red-300 bg-red-50 text-red-700 transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 hover:bg-red-100 hover:border-red-400";
      case "ghost":
        return "border border-transparent bg-transparent text-slate-600 transition disabled:cursor-not-allowed disabled:text-slate-400 hover:bg-slate-100 hover:text-slate-900";
      case "primary":
      default:
        return "bg-slate-950 text-white transition disabled:cursor-not-allowed disabled:bg-slate-400 hover:bg-slate-800";
    }
  }

  private getSizeClassName(size: ButtonSize): string {
    switch (size) {
      case "sm":
        return "h-9 rounded-xl px-4 text-sm";
      case "lg":
        return "h-14 rounded-3xl px-8 text-base";
      case "md":
      default:
        return "h-11 rounded-2xl px-5 text-sm";
    }
  }

  render() {
    const {
      children,
      className = "",
      variant = "primary",
      size = "md",
      icon,
      ...buttonProps
    } = this.props;

    return (
      <button
        {...buttonProps}
        className={`inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-400/40 ${this.getVariantClassName(variant)} ${this.getSizeClassName(size)} ${className}`}
      >
        {icon ? <span className="flex-shrink-0">{icon}</span> : null}
        {children}
      </button>
    );
  }
}