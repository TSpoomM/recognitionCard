'use client';

import { ChangeEvent, Component } from "react";
import { User } from "../../../types/user";
import RecognitionUserSelect from "../userSelected/RecognitionUserSelect";
import { LanguageContext } from "../../../context/LanguageContext";
import Input from "../../ui/Input";
import Select from "../../ui/Select";

type RecognitionUserStepProps = {
  filteredUsers: User[];
  selectedUsers: User[];
  selectedUserIds: string[];
  searchQuery: string;
  selectedBranch: string;
  availableBranches: string[];
  onSearchChange: (value: string) => void;
  onToggleUser: (userId: string) => void;
  onBranchChange: (branch: string) => void;
};

export default class RecognitionUserStep extends Component<RecognitionUserStepProps> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  private handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.props.onSearchChange(event.target.value);
  };

  private handleBranchChange = (event: ChangeEvent<HTMLSelectElement>) => {
    this.props.onBranchChange(event.target.value);
  };

  render() {
    const { filteredUsers, selectedUsers, selectedUserIds, searchQuery, selectedBranch, availableBranches, onToggleUser } = this.props;
    const { t, lang } = this.context;

    return (
      <>
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">{t.step1Title}</h2>
        <p className="mb-6 text-base text-slate-600">
          {t.step1Description}
        </p>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-48">
            <Select
              label={lang === "th" ? "สาขา" : "Branch / Location"}
              value={selectedBranch}
              onChange={this.handleBranchChange}
              options={[
                { value: "", label: lang === "th" ? "ทุกสาขา" : "All branches" },
                ...availableBranches.map((branch) => ({ value: branch, label: branch })),
              ]}
            />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={this.handleSearchChange}
              placeholder={t.step1SearchPlaceholder}
            />
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <button
                key={user.user_id}
                type="button"
                onClick={() => onToggleUser(user.user_id)}
                className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-amber-400 bg-teal-800 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:border-amber-400 hover:bg-teal-900"
              >
                {user.firstName} {user.lastName}
                <span className="text-teal-100">x</span>
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

