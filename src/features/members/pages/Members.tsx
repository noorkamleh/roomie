import "../styles/members.css";
import MembersHeader from "../components/MembersHeader";
import HouseholdSettings from "../components/HouseholdSettings";
import AddMemberForm from "../components/AddMemberForm";
import BalanceTransfers from "../components/BalanceTransfers";
import MemberDirectory from "../components/MemberDirectory";
import MembersTabs from "../components/MembersTabs";
import DemoDataPanel from "../components/DemoDataPanel";
import { useMembers } from "../hooks/useMembers";
import { useMemberSections } from "../hooks/useMemberSections";
function Members() {
  const {
    householdName,
    currentUser,
    entries,
    error,
    removeMember,
    archiveMember,
    restoreMember,
  } = useMembers();
  const { tab, changeTab, settleMember, transfers } = useMemberSections();
  return (
    <div className="members-page">
      <MembersHeader
        householdName={householdName}
        count={entries.filter(({ member }) => !member.archived).length}
      />
      <MembersTabs value={tab} onChange={changeTab} />
      <div
        className="members-tab-content"
        role="tabpanel"
        id="members-tab-panel"
        aria-labelledby={`members-tab-${tab}`}
      >
        {tab === "Household" && (
          <div className="members-management-sidebar">
            <HouseholdSettings />
            <AddMemberForm />
          </div>
        )}
        <MemberDirectory
          entries={entries.filter(
            ({ member, balance }) =>
              tab === "Household" || !member.archived || balance !== 0,
          )}
          currentUser={currentUser}
          error={error}
          onDelete={removeMember}
          onArchive={archiveMember}
          onRestore={restoreMember}
          onSettle={settleMember}
        />
        {tab === "Balances" && <BalanceTransfers controller={transfers} />}
        {tab === "Household" && <DemoDataPanel />}
      </div>
    </div>
  );
}
export default Members;
