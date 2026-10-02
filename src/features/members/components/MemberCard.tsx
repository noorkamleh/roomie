import type { Member } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
function MemberCard({
  member,
  balance,
  current,
  tone,
}: {
  member: Member;
  balance: number;
  current: boolean;
  tone: number;
}) {
  return (
    <article className="panel">
      <div className="flex items-center gap-3">
        <div className={`member-avatar member-tone-${tone}`}>
          {member.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold">{member.name}</h2>
          <p className="text-xs text-[#8A809E]">
            {current ? "Current view" : "Household member"}
          </p>
        </div>
      </div>
      <p
        className={`mt-5 text-2xl font-bold ${balance > 0 ? "text-[#169A76]" : balance < 0 ? "text-[#E35888]" : "text-[#8C7FA4]"}`}
      >
        {balance > 0 ? "+" : ""}
        {formatCurrency(balance)}
      </p>
      <p className="mt-1 text-xs text-[#8A809E]">
        {balance > 0
          ? "Receivable from the household"
          : balance < 0
            ? "Owed to the household"
            : "All settled"}
      </p>
    </article>
  );
}
export default MemberCard;
