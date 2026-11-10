// Filtres en pastilles : une ligne qui défile horizontalement sur mobile,
// plusieurs lignes sur écran large.
export default function FilterChips({ options, value, onChange, className = "" }) {
  return (
    <div
      className={`-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden ${className}`}
      role="tablist"
    >
      {options.map((f) => {
        const actif = value === f;
        return (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={actif}
            onClick={() => onChange(f)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] transition-colors ${
              actif ? "bg-[#FF4500] text-white" : "border border-white/[0.08] text-white/50 hover:text-white/80"
            }`}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}
