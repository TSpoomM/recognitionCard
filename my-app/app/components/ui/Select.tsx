'use client';

import { SelectHTMLAttributes, forwardRef } from "react";

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
    ({ label, error, options, placeholder, className = "", ...selectProps }, ref) => {
        return (
            <div className="w-full">
                {label ? (
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        {label}
                    </label>
                ) : null}
                <select
                    ref={ref}
                    {...selectProps}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-slate-400/40 ${error
                            ? "border-red-300 focus:border-red-400 focus:ring-red-300/40"
                            : "border-slate-200 hover:border-slate-300 focus:border-slate-400"
                        } ${className}`}
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
                {error ? (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                ) : null}
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;