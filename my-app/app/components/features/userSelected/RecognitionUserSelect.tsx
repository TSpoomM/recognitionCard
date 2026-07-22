'use client';

import { Component } from "react";
import { User } from "../../../types/user";
import { LanguageContext } from "../../../context/LanguageContext";

type RecognitionUserSelectProps = {
  users: User[];
  selectedUserIds: string[];
  onToggleUser: (userId: string) => void;
};

function getDisplayName(user: User, lang: string) {
  return (lang === "th" ? user.thaiName : "") || `${user.firstName} ${user.lastName}`.trim();
}

function getInitials(displayName: string) {
  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "?";
  // return "EIEI";
}

export default class RecognitionUserSelect extends Component<RecognitionUserSelectProps> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  render() {
    const { users, selectedUserIds, onToggleUser } = this.props;

    return (
      <div className="max-h-[640px] overflow-y-auto pr-2 sm:max-h-[360px]">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {users.map((user) => {
            const selected = selectedUserIds.includes(user.user_id);
            // const displayName = getDisplayName(user, this.context.lang);
            const displayName = getDisplayName(user, "en");
            // console.log("context", this.context);

            return (
              <button
                key={user.user_id}
                type="button"
                onClick={() => onToggleUser(user.user_id)}
                className={`relative flex min-h-[80px] items-start gap-4 rounded-3xl border-[1.5px] p-4 text-left transition ${selected
                  ? "border-amber-400 bg-teal-50/70 shadow-sm ring-2 ring-amber-100"
                  : "border-amber-300 bg-white text-slate-900 hover:border-amber-400 hover:bg-amber-50/30"
                  }`}
              >
                <div className="relative grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-2xl bg-teal-50 text-base font-bold text-teal-700">
                  {getInitials(displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p title={displayName} className="truncate text-lg font-semibold text-slate-900">{displayName}</p>
                  <p title={(this.context.lang === "th" ? user.branchDesc : user.branchNameEn) || user.branchDesc || user.branchNameEn || user.location || ""} className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                    {(this.context.lang === "th" ? user.branchDesc : user.branchNameEn) || user.branchDesc || user.branchNameEn || user.location || "-"}
                  </p>
                  {user.team && <p className="truncate text-sm text-slate-500">{user.team}</p>}
                </div>
                <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] ${selected ? "border-amber-400 bg-teal-600 text-white" : "border-amber-300 bg-white text-slate-300"}`}>
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
