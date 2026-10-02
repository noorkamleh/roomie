import PageHeader from "../../../shared/components/PageHeader";
import HouseholdSettings from "../components/HouseholdSettings";
import AddMemberForm from "../components/AddMemberForm";
import BalanceTransfers from "../components/BalanceTransfers";
import MemberCard from "../components/MemberCard";
import { useMembers } from "../hooks/useMembers";
function Members() {
  const { householdName, currentUser, entries } = useMembers();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Household members"
        description={`${householdName} / ${entries.length} members sharing one home.`}
      />
      <HouseholdSettings key={`${householdName}-${currentUser}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map(({ member, balance }, index) => (
          <MemberCard
            key={member.id}
            member={member}
            balance={balance}
            current={member.name === currentUser}
            tone={index % 3}
          />
        ))}
      </div>
      <BalanceTransfers />
      <AddMemberForm />
    </div>
  );
}
export default Members;
