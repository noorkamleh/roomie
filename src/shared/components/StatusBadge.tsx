const styles: Record<string, string> = {
  paid: "bg-[#DCF9EE] text-[#187B5A]",
  completed: "bg-[#DCF9EE] text-[#187B5A]",
  pending: "bg-[#F0E9FF] text-[#7949C7]",
  "in-progress": "bg-[#E6F0FF] text-[#326CC6]",
  "due-soon": "bg-[#FFF2D9] text-[#9C6B15]",
  overdue: "bg-[#FFE8EE] text-[#BC4167]",
};
function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] ?? styles.pending}`}
    >
      {status.replaceAll("-", " ")}
    </span>
  );
}
export default StatusBadge;
