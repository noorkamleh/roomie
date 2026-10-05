import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import MemberCard from "./MemberCard";
import type { Member } from "../../../shared/types";

function MemberDirectory({
  entries,
  currentUser,
  error,
  onDelete,
  onArchive,
  onRestore,
  onSettle,
}: {
  entries: { member: Member; balance: number }[];
  currentUser: string;
  error: string | null;
  onDelete: (member: Member) => void;
  onArchive: (member: Member) => void;
  onRestore: (member: Member) => void;
  onSettle: (member: Member) => void;
}) {
  const { t } = usePreferences();
  return (
    <section
      className="members-directory"
      aria-labelledby="members-directory-heading"
    >
      <div className="members-directory-heading">
        <h2 id="members-directory-heading">{t("Your housemates")}</h2>
        <p>{t("Balances include recorded repayments.")}</p>
      </div>
      {error && (
        <p role="alert" className="form-error members-delete-error">
          {error}
        </p>
      )}
      <div className="members-card-grid">
        {entries.map(({ member, balance }) => (
          <MemberCard
            key={member.id}
            member={member}
            balance={balance}
            current={member.name === currentUser}
            onDelete={onDelete}
            onArchive={onArchive}
            onRestore={onRestore}
            onSettle={onSettle}
          />
        ))}
      </div>
    </section>
  );
}
export default MemberDirectory;
