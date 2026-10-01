import type { Member } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { isMoney } from "../../household/model/validation";
import { splitExpense } from "../utils/calculations";

interface ExpenseSplitFieldsProps {
  members: Member[];
  amount: number;
  participants: string[];
  onChange: (participants: string[]) => void;
}

function ExpenseSplitFields({
  members,
  amount,
  participants,
  onChange,
}: ExpenseSplitFieldsProps) {
  const shares =
    isMoney(amount) && participants.length > 0
      ? splitExpense({ amount, participants })
      : [];
  return (
    <fieldset className="rounded-2xl border border-[#EAE3F7] p-4">
      <legend className="px-2 text-sm font-semibold text-[#4A3F6C]">
        Split between
      </legend>
      <div className="flex flex-wrap gap-4">
        {members.map((member) => (
          <label key={member.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={participants.includes(member.name)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...participants, member.name]
                    : participants.filter((name) => name !== member.name),
                )
              }
            />
            {member.name}
          </label>
        ))}
      </div>
      {shares.length > 0 && (
        <div className="mt-4 space-y-1 border-t border-[#EFE9F8] pt-3">
          {shares.map((share) => (
            <p
              key={share.member}
              className="flex justify-between text-xs text-[#817595]"
            >
              <span>{share.member}'s share</span>
              <span>{formatCurrency(share.cents / 100)}</span>
            </p>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-[#8A809E]">
        Shares are equal; any remaining halalas go to the first selected
        members.
      </p>
    </fieldset>
  );
}
export default ExpenseSplitFields;
