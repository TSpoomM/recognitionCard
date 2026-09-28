'use client';

import { Component, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AlertCircleIcon, CheckIcon } from "./Icons";

type ToastType = "error" | "success";

type ToastProps = {
  message: ReactNode;
  type: ToastType;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
};

type ToastState = {
  mounted: boolean;
};

export default class Toast extends Component<ToastProps, ToastState> {
  private timeoutId: number | null = null;

  constructor(props: ToastProps) {
    super(props);
    this.state = {
      mounted: false,
    };
  }

  componentDidMount() {
    const { autoClose = true, duration = 4000, onClose } = this.props;
    this.setState({ mounted: true });

    if (autoClose) {
      this.timeoutId = window.setTimeout(() => {
        onClose();
      }, duration);
    }
  }

  componentWillUnmount() {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
    }
  }

  private get icon() {
    const { type } = this.props;
    if (type === "error") {
      return <AlertCircleIcon className="h-7 w-7 flex-shrink-0 text-red-600" />;
    }
    return <CheckIcon className="h-7 w-7 flex-shrink-0 text-emerald-700" />;
  }

  private get toneClassName() {
    const { type } = this.props;
    if (type === "error") {
      return "border-red-300 bg-red-50/95 text-red-800 shadow-red-900/10";
    }
    return "border-emerald-300 bg-emerald-50/95 text-emerald-900 shadow-emerald-900/10";
  }

  render() {
    const { message, onClose } = this.props;

    if (!this.state.mounted) {
      return null;
    }

    return createPortal(
      <div
        className={`fixed right-6 top-6 z-[80] flex w-[min(92vw,34rem)] items-center gap-4 rounded-2xl border-2 px-5 py-4 shadow-lg backdrop-blur ${this.toneClassName}`}
      >
        {this.icon}
        <p className="flex-1 text-lg font-semibold leading-7">{message}</p>
        <button
          onClick={onClose}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-white/70"
          aria-label="Close notification"
        >
          <X className="h-5 w-5" />
        </button>
      </div>,
      document.body
    );
  }
}
