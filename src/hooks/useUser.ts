import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

interface UserContextType {
  currentUser: string | null;
  users: string[];
  login: (name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  login: async () => {},
  logout: () => {},
  loading: true,
});

export function useUser() {
  return useContext(UserContext);
}

export function useUserProvider(): UserContextType {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ratbv-user");
    if (stored) setCurrentUser(stored);

    api.getUsers().then((data) => {
      setUsers(data.users);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const login = useCallback(async (name: string) => {
    await api.createUser(name);
    localStorage.setItem("ratbv-user", name);
    setCurrentUser(name);
    const data = await api.getUsers();
    setUsers(data.users);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ratbv-user");
    setCurrentUser(null);
  }, []);

  return { currentUser, users, login, logout, loading };
}
