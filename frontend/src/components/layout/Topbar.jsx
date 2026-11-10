import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, CalendarDays, Menu } from "lucide-react";

export default function Topbar({ onMenu, notifCount = 0 }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(`/suivi${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#16171B]/85 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <button onClick={onMenu} className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={submit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une commande, un colis, un client…"
            className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#121316] pl-10 pr-4 text-base text-white placeholder:text-white/30 sm:text-[13px] focus:border-[#FF4500]/50 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/15"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-[#121316] px-3 py-2 text-[12px] text-white/55 md:flex">
            <CalendarDays className="h-3.5 w-3.5 text-white/35" />
            07 – 13 Nov. 2026
          </div>
          <button
            onClick={() => navigate("/notifications")}
            className="relative rounded-xl border border-white/[0.06] bg-[#121316] p-2.5 text-white/55 transition-colors hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-[17px] w-[17px]" />
            {notifCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#FF4500] px-1 text-[10px] font-semibold text-white">
                {notifCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}