import { PackageOpen } from "lucide-react";

export default function EmptyState({ message = "Aucun élément pour le moment.", action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04]">
        <PackageOpen className="h-5 w-5 text-white/25" />
      </span>
      <p className="max-w-xs text-[12.5px] text-white/40">{message}</p>
      {action}
    </div>
  );
}