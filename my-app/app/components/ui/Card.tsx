'use client';

import { Component, HTMLAttributes, ReactNode } from "react";

type CardSurface = "white" | "muted";
type CardPadding = "none" | "sm" | "md" | "lg" | "xl";
type CardShadow = "none" | "sm" | "xl";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  bordered?: boolean;
  padding?: CardPadding;
  shadow?: CardShadow;
  surface?: CardSurface;
};

export default class Card extends Component<CardProps> {
  private get surfaceClassName() {
    return this.props.surface === "muted" ? "bg-slate-50" : "bg-white";
  }

  private get paddingClassName() {
    const padding = this.props.padding ?? "md";

    if (padding === "none") return "";
    if (padding === "sm") return "p-4";
    if (padding === "lg") return "p-6";
    if (padding === "xl") return "p-8 sm:p-10";
    return "p-5";
  }

  private get shadowClassName() {
    const shadow = this.props.shadow ?? "sm";

    if (shadow === "none") return "";
    if (shadow === "xl") return "shadow-xl shadow-slate-200/80";
    return "shadow-sm";
  }

  render() {
    const {
      bordered = true,
      children,
      className = "",
      padding,
      shadow,
      surface,
      ...divProps
    } = this.props;
    void padding;
    void shadow;
    void surface;

    return (
      <div
        {...divProps}
        className={`rounded-3xl ${bordered ? "border border-slate-200" : ""} ${this.surfaceClassName} ${this.paddingClassName} ${this.shadowClassName} ${className}`}
      >
        {children}
      </div>
    );
  }
}
