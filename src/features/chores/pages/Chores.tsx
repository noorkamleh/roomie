import "../styles/chores.css";
import ChoresHeader from "../components/ChoresHeader";
import Modal from "../../../shared/components/Modal";
import EmptyState from "../../../shared/components/EmptyState";
import ChoreForm from "../components/ChoreForm";
import ChoreCard from "../components/ChoreCard";
import ChoreFilters from "../components/ChoreFilters";
import { useChoreList } from "../hooks/useChoreList";

function Chores() {
  const {
    entries,
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
      <div className="chore-card-grid">
        {entries.map((chore) => (
          <ChoreCard
            key={chore.id}
            chore={chore}
            today={today}
            onStatusChange={changeStatus}
          />
        ))}
      </div>
      {entries.length === 0 && <EmptyState message="No chores in this view." />}
      {adding && (
        <Modal title="Add chore" onClose={closeAdd}>
          <ChoreForm onSaved={closeAdd} />
        </Modal>
      )}
    </div>
  );
}
export default Chores;
