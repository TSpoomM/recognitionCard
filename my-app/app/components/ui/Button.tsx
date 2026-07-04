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
        return "border-[1.5px] border-amber-300 bg-white/90 text-slate-800 transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 hover:border-amber-400 hover:bg-amber-50";
      case "danger":
        return "border border-red-300 bg-red-50 text-red-700 transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 hover:bg-red-100 hover:border-red-400";
      case "ghost":
        return "border border-transparent bg-transparent text-slate-600 transition disabled:cursor-not-allowed disabled:text-slate-400 hover:bg-teal-50 hover:text-teal-900";
      case "primary":
      default:
        return "bg-teal-800 text-white shadow-sm shadow-teal-900/25 transition disabled:cursor-not-allowed disabled:bg-slate-400 hover:bg-teal-900";
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
        className={`inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300/35 ${this.getVariantClassName(variant)} ${this.getSizeClassName(size)} ${className}`}
      >
        {icon ? <span className="flex-shrink-0">{icon}</span> : null}
        {children}
      </button>
    );
  }
}
