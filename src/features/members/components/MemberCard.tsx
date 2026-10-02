import { UserRound } from "lucide-react";
import type { Member } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { balanceAppearance } from "../utils/presentation";
import type { MemberTone } from "../utils/presentation";
import MemberAvatar from "./MemberAvatar";
function MemberCard({
  member,
  balance,
  current,
  tone,
}: {
  member: Member;
  balance: number;
  current: boolean;
  tone: MemberTone;
}) {
  const { status, label, description, icon: Icon } = balanceAppearance(balance);
  return (
    <article
      className={`member-card member-card--${status} ${current ? "member-card--current" : ""}`}
    >
      <div className="member-card-heading">
        <MemberAvatar name={member.name} avatar={member.avatar} tone={tone} />
        <div className="member-card-person">
          <h3>{member.name}</h3>
          <p>{current ? "Current view" : "Household member"}</p>
        </div>
        {current && (
          <span className="member-current-badge">
            <UserRound size={11} aria-hidden="true" />
            You
          </span>
        )}
      </div>
      <div className="member-card-balance">
        <p>Net balance</p>
        <strong>
          {balance > 0 ? "+" : ""}
          {formatCurrency(balance)}
        </strong>
      </div>
      <div className="member-card-footer">
        <span className="member-balance-status">
          <Icon size={13} aria-hidden="true" />
          {label}
        </span>
        <p>{description}</p>
      </div>
    </article>
  );
}
export default MemberCard;
