import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const { login, users, currentUser } = useUser();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await login(name.trim());
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectUser(selectedName: string) {
    if (!selectedName) return;
    setLoading(true);
    try {
      await login(selectedName);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-primary tracking-tight">RATBV</h1>
          <p className="text-muted-foreground mt-1 text-sm">Bus Times Brasov</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {users.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cont existent
              </label>
              <Select
                disabled={loading}
                defaultValue=""
                onChange={(e) => handleSelectUser(e.target.value)}
              >
                <option value="" disabled>Alege un cont...</option>
                {users.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </Select>
            </div>
          )}

          {users.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">sau</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cont nou
              </label>
              <Input
                placeholder="Numele tau"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
              {loading ? "Se incarca..." : "Continua"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
