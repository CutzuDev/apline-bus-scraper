import { getUserNames, getUser, saveUser } from "../lib/store";

export async function handleUsers(req: Request, url: URL): Promise<Response | null> {
  const method = req.method;

  if (url.pathname === "/api/users" && method === "GET") {
    const names = await getUserNames();
    return Response.json({ users: names });
  }

  if (url.pathname === "/api/users" && method === "POST") {
    const { name } = await req.json() as { name: string };
    if (!name || !name.trim()) {
      return Response.json({ message: "Numele este obligatoriu" }, { status: 400 });
    }

    const trimmed = name.trim();
    const existing = await getUser(trimmed);
    if (!existing) {
      await saveUser({ name: trimmed, routes: [] });
    }

    return Response.json({ name: trimmed }, { status: 201 });
  }

  if (url.pathname.startsWith("/api/users/") && method === "GET") {
    const name = decodeURIComponent(url.pathname.split("/api/users/")[1]);
    const user = await getUser(name);
    if (!user) {
      return Response.json({ message: "Utilizatorul nu a fost gasit" }, { status: 404 });
    }
    return Response.json(user);
  }

  return null;
}
