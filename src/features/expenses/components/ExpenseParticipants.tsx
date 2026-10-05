import type { Member } from "../../../shared/types";
import { memberTone } from "../../../shared/utils/memberTone";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function ExpenseParticipants({
  participants,
  members,
}: {
  participants: string[];
  members: Member[];
}) {
  const { t } = usePreferences();
  return (
    <div
      className="expense-participants"
      aria-label={t("Participants: {participants}", {
        participants: participants.join(", "),
      })}
    >
      {participants.slice(0, 4).map((name) => {
        const avatar = members.find((member) => member.name === name)?.avatar;
        return (
          <span
            key={name}
            title={name}
            className="expense-share-avatar member-identity"
            data-member-tone={memberTone(name)}
          >
            {avatar ? (
              <img src={avatar} alt={name} />
            ) : (
              name.slice(0, 1).toUpperCase()
            )}
          </span>
        );
      })}
      {participants.length > 4 && (
        <span className="expense-share-avatar expense-person-0">
          +{participants.length - 4}
        </span>
      )}
    </div>
  );
}
export default ExpenseParticipants;
