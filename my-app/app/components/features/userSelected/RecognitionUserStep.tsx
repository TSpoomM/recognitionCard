'use client';

import { ChangeEvent, Component } from "react";
import { User } from "../../../types/user";
import RecognitionUserSelect from "../userSelected/RecognitionUserSelect";

type RecognitionUserStepProps = {
  filteredUsers: User[];
  selectedUsers: User[];
  selectedUserIds: string[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggleUser: (userId: string) => void;
};

export default class RecognitionUserStep extends Component<RecognitionUserStepProps> {
  private handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.props.onSearchChange(event.target.value);
  };

  render() {
    const { filteredUsers, selectedUsers, selectedUserIds, searchQuery, onToggleUser } = this.props;

    return (
      <>
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">Choose Recipients</h2>
        <p className="mb-6 text-base text-slate-600">
          Pick one or more teammates to recognize.
        </p>
        <div className="mb-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={this.handleSearchChange}
            placeholder="Search by name, team, role..."
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <button
                key={user.user_id}
                type="button"
                onClick={() => onToggleUser(user.user_id)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {user.firstName} {user.lastName}
                <span className="text-slate-300">x</span>
              </button>
            ))}
          </div>
        )}

        <RecognitionUserSelect
          users={filteredUsers}
          selectedUserIds={selectedUserIds}
          onToggleUser={onToggleUser}
        />
      </>
    );
  }
}
