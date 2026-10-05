import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import "../styles/chores.css";
import ChoresHeader from "../components/ChoresHeader";
import Modal from "../../../shared/components/Modal";
import ChoreForm from "../components/ChoreForm";
import ChoreList from "../components/ChoreList";
import ChoreFilters from "../components/ChoreFilters";
import { useChoreList } from "../hooks/useChoreList";

function Chores() {
  const { t } = usePreferences();
  const {
    entries,
    counts,
    personalEntries,
    personalOpenCount,
    currentUser,
    members,
    today,
    filter,
    setFilter,
    error,
    adding,
    openAdd,
    closeAdd,
    changeStatus,
    requestSwap,
    respondToSwap,
  } = useChoreList();
  return (
    <div className="chores-page">
      <ChoresHeader onAdd={openAdd} />
      <ChoreFilters filter={filter} counts={counts} onChange={setFilter} />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <ChoreList
        key={`personal-${filter}`}
        showCompleted={filter === "completed"}
        variant="personal"
        owner={currentUser}
        openCount={personalOpenCount}
        entries={personalEntries}
        today={today}
        onStatusChange={changeStatus}
        currentUser={currentUser}
        members={members}
        onSwapRequest={requestSwap}
        onSwapResponse={respondToSwap}
      />
      <ChoreList
        key={`household-${filter}`}
        showCompleted={filter === "completed"}
        variant="household"
        entries={entries}
        today={today}
        onStatusChange={changeStatus}
        currentUser={currentUser}
        members={members}
        onSwapRequest={requestSwap}
        onSwapResponse={respondToSwap}
      />
      {adding && (
        <Modal title={t("Add chore")} onClose={closeAdd}>
          <ChoreForm onSaved={closeAdd} />
        </Modal>
      )}
    </div>
  );
}
export default Chores;
