import { Link, Outlet, useLocation } from "react-router-dom";
import { UserSwitcher } from "./UserSwitcher";
import { useUser } from "@/hooks/useUser";

export function Layout() {
  const { currentUser } = useUser();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link to="/" className="text-primary font-black text-xl tracking-tight">
              RATBV
            </Link>
            {currentUser && (
              <nav className="flex gap-1">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Acasa
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/dashboard" || pathname === "/add-line"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Dashboard
                </Link>
              </nav>
            )}
          </div>
          <UserSwitcher />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-5">
        <Outlet />
      </main>
    </div>
  );
}
