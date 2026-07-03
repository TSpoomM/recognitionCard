'use client';

import { Component, ReactNode } from "react";
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

export default class Toast extends Component<ToastProps> {
  private timeoutId: number | null = null;

  componentDidMount() {
    const { autoClose = true, duration = 4000, onClose } = this.props;
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
      return <AlertCircleIcon className="h-5 w-5 flex-shrink-0" />;
    }
    return <CheckIcon className="h-5 w-5 flex-shrink-0" />;
  }

  private get backgroundColor() {
    const { type } = this.props;
    if (type === "error") {
      return "bg-red-500";
    }
    return "bg-emerald-500";
  }

  render() {
    const { message, onClose } = this.props;
    const bgColor = this.backgroundColor;

    return (
      <div
        className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-xl ${bgColor} px-4 py-4 text-white shadow-lg shadow-slate-900/20`}
      >
        {this.icon}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
}