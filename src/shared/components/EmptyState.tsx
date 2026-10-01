function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-[#DDD3F5] bg-[#FAF8FF] px-6 py-10 text-center text-sm text-[#82799F]">
      {message}
    </p>
  );
}
export default EmptyState;
