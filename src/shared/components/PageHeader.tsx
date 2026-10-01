import type { ReactNode } from "react";
function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="relative flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9C80D6]">
          Shared home
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#17152C]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[#7973A5]">{description}</p>
      </div>
      {action}
    </header>
  );
}
export default PageHeader;
