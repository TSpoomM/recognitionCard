'use client';

import { ReactNode, useEffect, useCallback } from "react";
import { CloseIcon } from "./Icons";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
};

export default function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/30 p-4" onClick={onClose}>
            <div
                className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/80"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                {title || description ? (
                    <div className="border-b border-slate-200 px-6 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                {title ? (
                                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                                ) : null}
                                {description ? (
                                    <p className="mt-1 text-base text-slate-600">{description}</p>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="px-6 py-5">{children}</div>

                {footer ? (
                    <div className="border-t border-slate-200 px-6 py-4">{footer}</div>
                ) : null}
            </div>
        </div>
    );
}