import { House, UsersRound } from "lucide-react";
function MembersHeader({
  householdName,
  count,
}: {
  householdName: string;
  count: number;
}) {
  return (
    <header className="members-page-header">
      <div>
        <p className="members-eyebrow">
          <UsersRound size={14} aria-hidden="true" />
          Your household
        </p>
        <h1>Household members</h1>
        <p className="members-page-description">
          Manage your housemates, shared balances, and home settings.
        </p>
      </div>
      <div className="members-household-label">
        <span>
          <House size={18} aria-hidden="true" />
        </span>
        <div>
          <strong>{householdName}</strong>
          <p>
            {count} {count === 1 ? "member" : "members"} sharing one home
          </p>
        </div>
      </div>
    </header>
  );
}
export default MembersHeader;
