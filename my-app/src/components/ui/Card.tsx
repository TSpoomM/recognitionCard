'use client';

import { Component, HTMLAttributes, ReactNode } from "react";

type CardSurface = "white" | "muted" | "primary";
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
    switch (this.props.surface) {
      case "muted":
        return "bg-muted";
      case "primary":
        return "bg-primary text-primary-foreground";
      case "white":
      default:
        return "bg-card text-card-foreground";
    }
  }

  private get paddingClassName() {
    const padding = this.props.padding ?? "md";

    switch (padding) {
      case "none": return "";
      case "sm": return "p-4";
      case "lg": return "p-6";
      case "xl": return "p-8 sm:p-10";
      default: return "p-5";
    }
  }

  private get shadowClassName() {
    const shadow = this.props.shadow ?? "sm";

    switch (shadow) {
      case "none": return "";
      case "xl": return "shadow-xl shadow-teal-900/10";
      default: return "shadow-sm";
    }
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
        className={`rounded-3xl ${bordered ? "border border-border" : ""} ${this.surfaceClassName} ${this.paddingClassName} ${this.shadowClassName} ${className}`}
      >
        {children}
      </div>
    );
  }
}
