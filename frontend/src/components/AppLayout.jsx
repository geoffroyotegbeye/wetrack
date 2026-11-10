import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { api } from "@/api/client";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    api.entities.NotificationLog.count({ statut: "En attente" })
      .then(setNotifCount)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-[264px]">
        <Topbar onMenu={() => setMenuOpen(true)} notifCount={notifCount} />
        <main className="mx-auto max-w-[1500px] px-4 pb-14 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}