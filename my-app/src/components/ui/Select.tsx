'use client';

import { ChangeEvent, SelectHTMLAttributes, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type SelectOption = {
    value: string;
    label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = "", disabled, onChange, ...selectProps }, ref) => {
        const [open, setOpen] = useState(false);
        const rootRef = useRef<HTMLDivElement>(null);
        const selectedValue = selectProps.value ?? selectProps.defaultValue;
        const normalizedValue = selectedValue !== undefined ? String(selectedValue) : "";
        const selectedOption = useMemo(
            () => options.find((option) => option.value === normalizedValue),
            [normalizedValue, options]
        );
        const hasSelection = normalizedValue !== "";

        useEffect(() => {
            if (!open) return;

            const handlePointerDown = (event: PointerEvent) => {
                if (!rootRef.current?.contains(event.target as Node)) {
                    setOpen(false);
                }
            };

            document.addEventListener("pointerdown", handlePointerDown);
            return () => document.removeEventListener("pointerdown", handlePointerDown);
        }, [open]);

        const handleSelect = (value: string) => {
            if (disabled) return;

            setOpen(false);
            if (!onChange) return;

            onChange({
                target: { value },
                currentTarget: { value },
            } as ChangeEvent<HTMLSelectElement>);
        };

        return (
            <div ref={rootRef} className="w-full">
                {label ? (
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-600">
                        {label}
                    </label>
                ) : null}
                <div className="relative">
                    <select
                        ref={ref}
                        {...selectProps}
                        disabled={disabled}
                        onChange={onChange}
                        className="sr-only"
                    >
                        {placeholder ? (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        ) : null}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setOpen((current) => !current)}
                        className={`flex h-12 w-full items-center justify-between gap-3 rounded-2xl border-[1.5px] px-4 py-2.5 pr-3 text-left text-base font-semibold shadow-sm outline-none transition focus:ring-4 focus:ring-amber-300/35 disabled:cursor-not-allowed disabled:opacity-60 ${hasSelection
                            ? "border-amber-400 bg-teal-50 text-teal-950"
                            : "border-amber-300 bg-white/95"
                            } ${error
                                ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-300/30"
                                : "hover:border-amber-400 focus:border-amber-400"
                            } ${className}`}
                    >
                        <span className={selectedOption ? "truncate" : "truncate text-slate-500"}>
                            {selectedOption?.label ?? placeholder ?? options[0]?.label ?? "Select"}
                        </span>
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${hasSelection ? "bg-teal-800 text-white" : "bg-amber-50 text-amber-700"} ${open ? "rotate-180" : ""}`}>
                            <ChevronDown className="h-4 w-4" />
                        </span>
                    </button>

                    {open ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border-[1.5px] border-amber-300 bg-white/95 shadow-xl shadow-teal-900/10 backdrop-blur">
                            <div className="max-h-72 overflow-y-auto p-1.5">
                                {options.map((option) => {
                                    const active = option.value === normalizedValue;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-base font-semibold transition ${active
                                                ? "bg-teal-800 text-white"
                                                : "text-slate-800 hover:bg-amber-50 hover:text-teal-950"
                                                }`}
                                        >
                                            <span className="truncate">{option.label}</span>
                                            {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                </div>
                {error ? (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                ) : null}
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;
