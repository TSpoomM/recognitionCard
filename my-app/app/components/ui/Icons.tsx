'use client';

import { Logs, Clock, Check, Pencil, Trash, Send, X, AlertCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';

type IconProps = {
    className?: string;
};

export function QueueIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <Logs className={className} stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function ClockIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <Clock className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <Check className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function PencilIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <Pencil className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function TrashIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <Trash className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function SendIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <Send className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <X className={className} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function AlertCircleIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <AlertCircle className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function ChevronLeftIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <ChevronLeft className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function ChevronRightIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <ChevronRight className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    );
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <Search className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    );
}