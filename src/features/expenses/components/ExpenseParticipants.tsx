import type { Member } from "../../../shared/types";

function ExpenseParticipants({
  participants,
  members,
}: {
  participants: string[];
  members: Member[];
}) {
  return (
    <div
      className="expense-participants"
      aria-label={`Participants: ${participants.join(", ")}`}
    >
      {participants.slice(0, 4).map((name, index) => {
        const avatar = members.find((member) => member.name === name)?.avatar;
        return (
          <span
            key={name}
            title={name}
            className={`expense-share-avatar expense-person-${index % 3}`}
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
