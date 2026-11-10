import { statutClasses } from "@/lib/logistics";

export default function StatutBadge({ statut, className = "" }) {
  if (!statut) return null;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-medium ring-1 ring-inset ${statutClasses(statut)} ${className}`}
    >
      {statut}
    </span>
  );
}