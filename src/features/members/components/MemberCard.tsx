import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import {
  Archive,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  UserRound,
} from "lucide-react";
import type { Member } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { balanceAppearance } from "../utils/presentation";
import MemberAvatar from "./MemberAvatar";
function MemberCard({
  member,
  balance,
  current,
  onDelete,
  onArchive,
  onRestore,
  onSettle,
}: {
  member: Member;
  balance: number;
  current: boolean;
  onDelete: (member: Member) => void;
  onArchive: (member: Member) => void;
  onRestore: (member: Member) => void;
  onSettle: (member: Member) => void;
}) {
  const { t } = usePreferences();
  const { status, label, description, icon: Icon } = balanceAppearance(balance);
  return (
    <article
      className={`member-card member-card--${status} ${current ? "member-card--current" : ""}`}
    >
      <div className="member-card-heading">
        <MemberAvatar name={member.name} avatar={member.avatar} />
        <div className="member-card-person">
          <h3>{member.name}</h3>
          <p>
            {t(
              member.archived
                ? "Archived member"
                : current
                  ? "Current view"
                  : "Household member",
            )}
          </p>
        </div>
        {current && (
          <span className="member-current-badge">
            <UserRound size={11} aria-hidden="true" />
            {t("You")}
          </span>
        )}
        <details className="member-options">
          <summary
            role="button"
            aria-label={t("Member options for {name}", { name: member.name })}
          >
            <MoreHorizontal size={18} aria-hidden="true" />
          </summary>
          <div>
            <button
              type="button"
              onClick={() =>
                member.archived ? onRestore(member) : onArchive(member)
              }
            >
              {member.archived ? (
                <RotateCcw size={14} aria-hidden="true" />
              ) : (
                <Archive size={14} aria-hidden="true" />
              )}
              {t(member.archived ? "Restore member" : "Archive member")}
            </button>
            <button
              type="button"
              className="member-delete-button"
              aria-label={t("Delete member {name}", { name: member.name })}
              onClick={() => onDelete(member)}
            >
              <Trash2 size={14} aria-hidden="true" />
              {t("Delete permanently")}
            </button>
          </div>
        </details>
      </div>
      <div className="member-card-balance">
        <p>{t("Net balance")}</p>
        <strong>
          {balance > 0 ? "+" : ""}
          {formatCurrency(balance)}
        </strong>
      </div>
      <div className="member-card-footer">
        <span className="member-balance-status">
          <Icon size={13} aria-hidden="true" />
          {t(label)}
        </span>
        <p>{t(description)}</p>
      </div>
      {balance !== 0 && (
        <div className="member-card-actions">
          <button
            type="button"
            className="member-settle-button"
            aria-label={t("Settle up with {name}", { name: member.name })}
            onClick={() => onSettle(member)}
          >
            {t("Settle up")}
          </button>
        </div>
      )}
    </article>
  );
}
export default MemberCard;
