'use client';

import { ReactNode, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/30 p-4" onClick={onClose}>
            <div
                className="app-surface max-h-[min(80vh,46rem)] w-full max-w-2xl overflow-y-auto rounded-3xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                {title || description ? (
                    <div className="border-b-[1.5px] border-amber-300 px-6 py-5">
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
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-amber-300 bg-white text-slate-500 transition hover:border-amber-400 hover:text-teal-900"
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="px-6 py-5">{children}</div>

                {footer ? (
                    <div className="border-t-[1.5px] border-amber-300 px-6 py-4">{footer}</div>
                ) : null}
            </div>
        </div>,
        document.body
    );
}
