import { getUser, saveUser } from "../lib/store";
import type { Route } from "../lib/types";

function getUserParam(url: URL): string | null {
  return url.searchParams.get("user");
}

export async function handleRoutes(req: Request, url: URL): Promise<Response | null> {
  const method = req.method;

  if (url.pathname === "/api/routes" && method === "GET") {
    const userName = getUserParam(url);
    if (!userName) {
      return Response.json({ message: "Parametrul ?user= este obligatoriu" }, { status: 400 });
    }

    const user = await getUser(userName);
    if (!user) {
      return Response.json({ message: "Utilizatorul nu a fost gasit" }, { status: 404 });
    }

    return Response.json(user.routes);
  }

  if (url.pathname === "/api/routes" && method === "POST") {
    const userName = getUserParam(url);
    if (!userName) {
      return Response.json({ message: "Parametrul ?user= este obligatoriu" }, { status: 400 });
    }

    const user = await getUser(userName);
    if (!user) {
      return Response.json({ message: "Utilizatorul nu a fost gasit" }, { status: 404 });
    }

    const newRoute: Route = await req.json();

    if (user.routes.some((r) => r.id === newRoute.id)) {
      return Response.json({ message: "Ruta cu acest ID exista deja" }, { status: 400 });
    }

    user.routes.push(newRoute);
    await saveUser(user);

    return Response.json({ success: true }, { status: 201 });
  }

  if (url.pathname === "/api/routes/reorder" && method === "PATCH") {
    const userName = getUserParam(url);
    if (!userName) {
      return Response.json({ message: "Parametrul ?user= este obligatoriu" }, { status: 400 });
    }

    const user = await getUser(userName);
    if (!user) {
      return Response.json({ message: "Utilizatorul nu a fost gasit" }, { status: 404 });
    }

    const { ids }: { ids: string[] } = await req.json();
    const routeMap = new Map(user.routes.map(r => [r.id, r]));
    user.routes = ids.map(id => routeMap.get(id)).filter(Boolean) as Route[];
    await saveUser(user);

    return Response.json({ success: true });
  }

  if (url.pathname.startsWith("/api/routes/") && method === "DELETE") {
    const userName = getUserParam(url);
    if (!userName) {
      return Response.json({ message: "Parametrul ?user= este obligatoriu" }, { status: 400 });
    }

    const user = await getUser(userName);
    if (!user) {
      return Response.json({ message: "Utilizatorul nu a fost gasit" }, { status: 404 });
    }

    const id = url.pathname.split("/api/routes/")[1];
    user.routes = user.routes.filter((r) => r.id !== id);
    await saveUser(user);

    return Response.json({ success: true });
  }

  return null;
}
