'use client';

import { Component } from "react";
import { User } from "../../../types/user";

type RecognitionUserSelectProps = {
  users: User[];
  selectedUserIds: string[];
  onToggleUser: (userId: string) => void;
};

export default class RecognitionUserSelect extends Component<RecognitionUserSelectProps> {
  render() {
    const { users, selectedUserIds, onToggleUser } = this.props;

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {users.map((user) => {
          const selected = selectedUserIds.includes(user.user_id);
          return (
            <button
              key={user.user_id}
              type="button"
              onClick={() => onToggleUser(user.user_id)}
              className={`relative flex items-start gap-4 rounded-3xl border p-4 text-left transition ${selected
                ? "border-slate-900 bg-white shadow-sm ring-2 ring-slate-200"
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                }`}
            >
              <div className="relative h-12 w-12 flex-shrink-0 rounded-2xl overflow-hidden">
                <img
                  src={user.photoUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                <p className="mt-1 text-xs text-slate-500">{user.role ? `${user.role}` : user.email}</p>
                {user.team && <p className="text-xs text-slate-500">{user.team}</p>}
              </div>
              <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-300"}`}>
                ✓
              </div>
            </button>
          );
        })}
      </div>
    );
  }
}
