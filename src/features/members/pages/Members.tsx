import { useHousehold } from "../../household/hooks/HouseholdContext";
import { calculateBalance } from "../../expenses/utils/calculations";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import PageHeader from "../../../shared/components/PageHeader";
import HouseholdSettings from "../../household/components/HouseholdSettings";
import AddMemberForm from "../../household/components/AddMemberForm";
import BalanceTransfers from "../../household/components/BalanceTransfers";
function Members() {
  const { state } = useHousehold();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Household members"
        description={`${state.name} / ${state.members.length} members sharing one home.`}
      />
      <HouseholdSettings key={`${state.name}-${state.currentUser}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {state.members.map((member, index) => {
          const balance = calculateBalance(
            state.expenses,
            member.name,
            state.settlements,
          );
          return (
            <article className="panel" key={member.id}>
              <div className="flex items-center gap-3">
                <div className={`member-avatar member-tone-${index % 3}`}>
                  {member.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold">{member.name}</h2>
                  <p className="text-xs text-[#8A809E]">
                    {member.name === state.currentUser
                      ? "Current view"
                      : "Household member"}
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
        })}
      </div>
      <BalanceTransfers />
      <AddMemberForm />
    </div>
  );
}
export default Members;
