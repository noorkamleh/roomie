import "../styles/members.css";
import MembersHeader from "../components/MembersHeader";
import HouseholdSettings from "../components/HouseholdSettings";
import AddMemberForm from "../components/AddMemberForm";
import BalanceTransfers from "../components/BalanceTransfers";
import MemberCard from "../components/MemberCard";
import { useMembers } from "../hooks/useMembers";
import { memberTones } from "../utils/presentation";
function Members() {
  const { householdName, currentUser, entries } = useMembers();
  return (
    <div className="members-page">
      <MembersHeader householdName={householdName} count={entries.length} />
      <section
        className="members-directory"
        aria-labelledby="members-directory-heading"
      >
        <div className="members-directory-heading">
          <h2 id="members-directory-heading">Your housemates</h2>
          <p>Balances include recorded repayments.</p>
        </div>
        <div className="members-card-grid">
          {entries.map(({ member, balance }, index) => (
            <MemberCard
              key={member.id}
              member={member}
              balance={balance}
              current={member.name === currentUser}
              tone={memberTones[index % memberTones.length]}
            />
          ))}
        </div>
      </section>
      <div className="members-management-grid">
        <BalanceTransfers />
        <div className="members-management-sidebar">
          <HouseholdSettings />
          <AddMemberForm />
        </div>
      </div>
    </div>
  );
}
export default Members;
