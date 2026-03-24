import { loadUsers, loadLog } from "../lib/store";
import { getNextBus } from "../lib/time";
import type { Route, NextBusResponse } from "../lib/types";

export async function handleNextBus(req: Request, url: URL): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/next-bus/") || req.method !== "GET") {
    return null;
  }

  const routeId = url.pathname.split("/api/next-bus/")[1];
  if (!routeId) {
    return Response.json({ message: "ID-ul rutei este obligatoriu" }, { status: 400 });
  }

  // Search across all users for this route
  const data = await loadUsers();
  let found: Route | undefined;

  for (const user of data.users) {
    found = user.routes.find((r) => r.id === routeId);
    if (found) break;
  }

  if (!found) {
    return Response.json({ message: "Ruta nu a fost gasita" }, { status: 404 });
  }

  const times = found.cachedBusTimes ?? [];
  const { next, inMinutes } = getNextBus(times);

  const response: NextBusResponse = {
    next,
    in_minutes: inMinutes,
    station: found.stationName,
    route: found.routeNumber.toUpperCase(),
  };

  return Response.json(response);
}
