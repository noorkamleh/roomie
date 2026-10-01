import "../styles/chores.css";
import ChoresHeader from "../components/ChoresHeader";
import Modal from "../../../shared/components/Modal";
import ChoreForm from "../components/ChoreForm";
import ChoreList from "../components/ChoreList";
import ChoreFilters from "../components/ChoreFilters";
import { useChoreList } from "../hooks/useChoreList";

function Chores() {
  const {
    entries,
    personalEntries,
    currentUser,
    today,
    filter,
    setFilter,
    error,
    adding,
    openAdd,
    closeAdd,
    changeStatus,
  } = useChoreList();
  return (
    <div className="chores-page">
      <ChoresHeader onAdd={openAdd} />
      <ChoreFilters filter={filter} onChange={setFilter} />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <ChoreList
        variant="personal"
        owner={currentUser}
        entries={personalEntries}
        today={today}
        onStatusChange={changeStatus}
      />
      <ChoreList
        variant="household"
        entries={entries}
        today={today}
        onStatusChange={changeStatus}
      />
      {adding && (
        <Modal title="Add chore" onClose={closeAdd}>
          <ChoreForm onSaved={closeAdd} />
        </Modal>
      )}
    </div>
  );
}
export default Chores;
