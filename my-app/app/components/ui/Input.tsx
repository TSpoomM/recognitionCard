'use client';

import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = "", ...inputProps }, ref) => {
        return (
            <div className="w-full">
                {label ? (
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        {label}
                    </label>
                ) : null}
                <input
                    ref={ref}
                    {...inputProps}
                    className={`w-full rounded-xl border-[1.5px] bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-amber-300/40 ${error
                            ? "border-red-300 focus:border-red-400 focus:ring-red-300/40"
                            : "border-amber-300 hover:border-amber-400 focus:border-amber-400"
                        } ${className}`}
                />
                {error ? (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
