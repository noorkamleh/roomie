import { ListChecks, Plus } from "lucide-react";

function ChoresHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="chores-page-header">
      <div>
        <p className="chores-eyebrow">
          <ListChecks size={14} aria-hidden="true" />
          Household tasks
        </p>
        <h1>Chores</h1>
        <p className="chores-page-description">
          Share the work, assign responsibilities, and keep your home running
          smoothly.
        </p>
      </div>
      <button
        type="button"
        className="primary-button chores-add-button"
        onClick={onAdd}
      >
        <span>
          <Plus size={19} aria-hidden="true" />
        </span>
        Add chore
      </button>
    </header>
  );
}
export default ChoresHeader;
