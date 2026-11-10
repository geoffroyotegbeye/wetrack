import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Commandes from "@/pages/Commandes";
import CommandeDetail from "@/pages/CommandeDetail";
import SuiviColis from "@/pages/SuiviColis";
import ColisDetail from "@/pages/ColisDetail";
import Cargaisons from "@/pages/Cargaisons";
import Clients from "@/pages/Clients";
import Notifications from "@/pages/Notifications";
import Tarifs from "@/pages/Tarifs";
import Rapports from "@/pages/Rapports";
import Parametres from "@/pages/Parametres";
import Utilisateurs from "@/pages/Utilisateurs";
import RequirePage from "@/components/RequirePage";
import EspaceClient from "@/pages/EspaceClient";
import MesCommandes from "@/pages/MesCommandes";
import MesNotifications from "@/pages/MesNotifications";
import MonCompte from "@/pages/MonCompte";
import { usePermissions } from "@/lib/permissions";

// Les pages de connexion renvoient à l'accueil si l'utilisateur est déjà connecté.
const GuestOnly = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// Accueil : tableau de bord pour l'équipe, espace client pour un client.
const Accueil = () => {
  const { canPage } = usePermissions();
  if (canPage("dashboard")) return <Dashboard />;
  if (canPage("espace_client")) return <Navigate to="/mes-colis" replace />;
  return <RequirePage page="dashboard"><Dashboard /></RequirePage>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
    <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Accueil />} />
        <Route path="/mes-colis" element={<RequirePage page="espace_client"><EspaceClient /></RequirePage>} />
        <Route path="/mes-commandes" element={<RequirePage page="mes_commandes"><MesCommandes /></RequirePage>} />
        <Route path="/mes-notifications" element={<RequirePage page="mes_notifications"><MesNotifications /></RequirePage>} />
        <Route path="/mon-compte" element={<RequirePage page="compte"><MonCompte /></RequirePage>} />
        <Route path="/commandes" element={<RequirePage page="commandes"><Commandes /></RequirePage>} />
        <Route path="/commandes/:id" element={<RequirePage page={["commandes", "commande_detail"]}><CommandeDetail /></RequirePage>} />
        <Route path="/suivi" element={<RequirePage page="suivi"><SuiviColis /></RequirePage>} />
        <Route path="/suivi/:id" element={<RequirePage page={["suivi", "suivi_detail"]}><ColisDetail /></RequirePage>} />
        <Route path="/cargaisons" element={<RequirePage page="cargaisons"><Cargaisons /></RequirePage>} />
        <Route path="/clients" element={<RequirePage page="clients"><Clients /></RequirePage>} />
        <Route path="/notifications" element={<RequirePage page="notifications"><Notifications /></RequirePage>} />
        <Route path="/tarifs" element={<RequirePage page="tarifs"><Tarifs /></RequirePage>} />
        <Route path="/rapports" element={<RequirePage page="rapports"><Rapports /></RequirePage>} />
        <Route path="/parametres" element={<RequirePage page="parametres"><Parametres /></RequirePage>} />
        <Route path="/utilisateurs" element={<RequirePage page="utilisateurs"><Utilisateurs /></RequirePage>} />
      </Route>
    </Route>

    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
