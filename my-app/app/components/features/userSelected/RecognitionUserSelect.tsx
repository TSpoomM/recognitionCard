'use client';

import { Component } from "react";
import { User } from "../../../types/user";

type RecognitionUserSelectProps = {
  users: User[];
  selectedUserIds: string[];
  onToggleUser: (userId: string) => void;
};

function getInitials(user: User) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.trim().toUpperCase() || "?";
}

export default class RecognitionUserSelect extends Component<RecognitionUserSelectProps> {
  render() {
    const { users, selectedUserIds, onToggleUser } = this.props;

    return (
      <div className="max-h-[640px] overflow-y-auto pr-2 sm:max-h-[360px]">
        <div className="grid gap-3 sm:grid-cols-2">
        {users.map((user) => {
          const selected = selectedUserIds.includes(user.user_id);
          return (
            <button
              key={user.user_id}
              type="button"
              onClick={() => onToggleUser(user.user_id)}
              className={`relative flex min-h-[112px] items-start gap-4 rounded-3xl border p-4 text-left transition ${selected
                ? "border-slate-900 bg-white shadow-sm ring-2 ring-slate-200"
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                }`}
            >
              <div className="relative grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100 text-base font-bold text-slate-600">
                {getInitials(user)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                <p className="mt-1 truncate text-sm text-slate-500">{user.role ? `${user.role}` : user.email}</p>
                {user.team && <p className="truncate text-sm text-slate-500">{user.team}</p>}
              </div>
              <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-300"}`}>
                ✓
              </div>
            </button>
          );
        })}
        </div>
      </div>
    );
  }
}
