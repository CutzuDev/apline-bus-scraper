import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserContext, useUserProvider, useUser } from "@/hooks/useUser";
import { Layout } from "@/components/Layout";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AddLinePage } from "@/pages/AddLinePage";
import { RoutePage } from "@/pages/RoutePage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default function App() {
  const userContext = useUserProvider();

  return (
    <UserContext.Provider value={userContext}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/add-line" element={<AddLinePage />} />
            <Route path="/route/:routeId" element={<RoutePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}
