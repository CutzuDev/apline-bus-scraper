import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";

export function UserSwitcher() {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();

  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:block">{currentUser}</span>
      <button
        className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Schimba cont
      </button>
    </div>
  );
}
