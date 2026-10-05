import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { useState } from "react";
import type { Chore, Member } from "../../../shared/types";

export interface ChoreSwapProps {
  currentUser: string;
  members: Member[];
  onSwapRequest: (chore: Chore, to: string) => boolean;
  onSwapResponse: (chore: Chore, accepted: boolean) => void;
}

function ChoreSwapControls({
  chore,
  currentUser,
  members,
  onSwapRequest,
  onSwapResponse,
}: ChoreSwapProps & { chore: Chore }) {
  const { t } = usePreferences();
  const [choosing, setChoosing] = useState(false);
  const [recipient, setRecipient] = useState("");
  const candidates = members.filter(
    (member) => !member.archived && member.name !== chore.assignedTo,
  );
  const selected = candidates.some((member) => member.name === recipient)
    ? recipient
    : (candidates[0]?.name ?? "");
  if (chore.status === "completed") return null;

  if (chore.swapRequest) {
    const request = chore.swapRequest;
    return (
      <div className="chore-swap-request">
        <p>
          {t("{from} requested a swap with {to}.", {
            from: request.requestedBy,
            to: request.requestedTo,
          })}
        </p>
        {currentUser === request.requestedTo ? (
          <div className="chore-swap-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => onSwapResponse(chore, true)}
            >
              {t("Accept swap")}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => onSwapResponse(chore, false)}
            >
              {t("Decline swap")}
            </button>
          </div>
        ) : (
          <p className="chore-record-date">
            {t("Waiting for {name}.", { name: request.requestedTo })}
          </p>
        )}
      </div>
    );
  }

  if (currentUser !== chore.assignedTo || candidates.length === 0) return null;
  return choosing ? (
    <form
      className="chore-swap-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (onSwapRequest(chore, selected)) setChoosing(false);
      }}
    >
      <label>
        {t("Swap {title} with", { title: chore.title })}
        <select
          value={selected}
          onChange={(event) => setRecipient(event.target.value)}
        >
          {candidates.map((member) => (
            <option key={member.id}>{member.name}</option>
          ))}
        </select>
      </label>
      <div className="chore-swap-actions">
        <button className="secondary-button" type="submit">
          {t("Send request")}
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setChoosing(false)}
        >
          {t("Cancel")}
        </button>
      </div>
    </form>
  ) : (
    <button
      className="chore-swap-button"
      type="button"
      onClick={() => setChoosing(true)}
    >
      {t("Request swap")}
    </button>
  );
}

export default ChoreSwapControls;
